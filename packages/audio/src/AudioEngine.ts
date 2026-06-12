import { BufferCache } from './BufferCache';
import { computeSpatialMix, ListenerPosition } from './SpatialMixer';
import {
  AudioTrack,
  DEFAULT_VOLUME_PREFS,
  PlayMusicOptions,
  PreloadManifest,
  VolumePrefs,
  AudioCatalogKind,
  AudioPrefetchEntry
} from './types';

const cacheKey = (id: string, kind: AudioCatalogKind) => `${kind}:${id}`;

interface ActiveLoop {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

interface SfxInstance {
  id: number;
  source: AudioBufferSourceNode;
  gain: GainNode;
  panner: StereoPannerNode;
}

let nextSfxInstanceId = 1;
const MAX_SFX_INSTANCES = 16;

export class AudioEngine {
  private context: AudioContext | null = null;
  private unlocked = false;
  private readonly cache = new BufferCache();
  private readonly trackGains: Partial<Record<AudioTrack, GainNode>> = {};
  private masterGain: GainNode | null = null;
  private prefs: VolumePrefs = { ...DEFAULT_VOLUME_PREFS };
  private listener: ListenerPosition = { x: 0, y: 0 };
  private musicLoop: ActiveLoop | null = null;
  private ambientLoop: ActiveLoop | null = null;
  private readonly sfxInstances = new Map<number, SfxInstance>();
  private resolveUrl: (path: string) => string = (path) => path;
  private catalog: PreloadManifest = {};

  setResolveUrl(resolver: (path: string) => string): void {
    this.resolveUrl = resolver;
  }

  get isUnlocked(): boolean {
    return this.unlocked;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }

    if (this.context) {
      return this.context;
    }

    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    this.context = new AudioContextCtor();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);

    for (const track of ['music', 'ambient', 'sfx', 'ui'] as AudioTrack[]) {
      const gain = this.context.createGain();
      gain.connect(this.masterGain);
      this.trackGains[track] = gain;
    }

    this.applyPrefs();
    return this.context;
  }

  async unlock(): Promise<void> {
    const context = this.initContext();
    if (!context) {
      return;
    }

    if (context.state === 'suspended') {
      await context.resume();
    }

    this.unlocked = true;
  }

  setPrefs(prefs: Partial<VolumePrefs>): void {
    this.prefs = {
      ...this.prefs,
      ...prefs,
      muted: { ...this.prefs.muted, ...prefs.muted }
    };
    this.applyPrefs();
  }

  getPrefs(): VolumePrefs {
    return { ...this.prefs };
  }

  setVolume(track: AudioTrack, volume: number): void {
    this.prefs[track] = Math.max(0, Math.min(1, volume));
    this.applyTrackGain(track);
  }

  setMuted(track: AudioTrack, muted: boolean): void {
    this.prefs.muted[track] = muted;
    this.applyTrackGain(track);
  }

  setListener(tileX: number, tileY: number): void {
    this.listener = { x: tileX, y: tileY };
  }

  /** Register manifest paths only — no network I/O. */
  registerManifest(manifest: PreloadManifest): void {
    this.catalog = {
      music: { ...this.catalog.music, ...manifest.music },
      sfx: { ...this.catalog.sfx, ...manifest.sfx }
    };
  }

  private resolvePath(id: string, kind: AudioCatalogKind): string | undefined {
    return kind === 'music'
      ? this.catalog.music?.[id]
      : this.catalog.sfx?.[id];
  }

  async ensureBuffer(
    id: string,
    kind: AudioCatalogKind
  ): Promise<AudioBuffer | undefined> {
    const context = this.ensureContext();
    const path = this.resolvePath(id, kind);
    if (!context || !path) {
      return undefined;
    }
    return this.cache.ensure(
      cacheKey(id, kind),
      path,
      context,
      this.resolveUrl
    );
  }

  /** Prefetch a subset into the decode cache (e.g. on map enter). */
  async prefetch(entries: AudioPrefetchEntry[]): Promise<void> {
    if (entries.length === 0) {
      return;
    }
    await Promise.all(
      entries.map(({ id, kind }) => this.ensureBuffer(id, kind))
    );
  }

  hasBuffer(id: string, kind: AudioCatalogKind): boolean {
    return this.cache.has(cacheKey(id, kind));
  }

  async playMusic(id: string, options: PlayMusicOptions = {}): Promise<void> {
    const buffer = await this.ensureBuffer(id, 'music');
    if (!buffer) {
      return;
    }
    this.startMusic(buffer, options);
  }

  private startMusic(buffer: AudioBuffer, options: PlayMusicOptions = {}): void {
    const { loop = true, fadeMs = 1500 } = options;

    if (!this.context || !this.trackGains.music) {
      return;
    }

    const previous = this.musicLoop;
    const ctx = this.context;
    const trackGain = this.trackGains.music;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();

    source.buffer = buffer;
    source.loop = loop;
    source.connect(gain);
    gain.connect(trackGain);
    gain.gain.value = 0;
    source.start(0);

    const targetGain = this.getEffectiveTrackVolume('music');
    const now = ctx.currentTime;

    if (previous) {
      previous.gain.gain.cancelScheduledValues(now);
      previous.gain.gain.setValueAtTime(previous.gain.gain.value, now);
      previous.gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
      const old = previous;
      source.onended = () => undefined;
      setTimeout(() => {
        try {
          old.source.stop();
        } catch {
          // already stopped
        }
        old.source.disconnect();
        old.gain.disconnect();
      }, fadeMs + 50);
    }

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(targetGain, now + fadeMs / 1000);

    this.musicLoop = { source, gain };
  }

  stopMusic(fadeMs = 1000): void {
    if (!this.musicLoop || !this.context) {
      return;
    }

    const { source, gain } = this.musicLoop;
    const now = this.context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);

    const loop = this.musicLoop;
    this.musicLoop = null;

    setTimeout(() => {
      try {
        loop.source.stop();
      } catch {
        // already stopped
      }
      loop.source.disconnect();
      loop.gain.disconnect();
    }, fadeMs + 50);
  }

  playAmbientLoop(id: string): void {
    void this.ensureBuffer(id, 'sfx').then((buffer) => {
      if (!buffer) {
        return;
      }
      this.startAmbientLoop(buffer);
    });
  }

  private startAmbientLoop(buffer: AudioBuffer): void {
    if (!this.context || !this.trackGains.ambient) {
      return;
    }

    this.stopAmbient(0);

    const ctx = this.context;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();

    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    gain.connect(this.trackGains.ambient!);
    gain.gain.value = this.getEffectiveTrackVolume('ambient');
    source.start(0);

    this.ambientLoop = { source, gain };
  }

  stopAmbient(fadeMs = 500): void {
    if (!this.ambientLoop || !this.context) {
      return;
    }

    const loop = this.ambientLoop;
    this.ambientLoop = null;

    if (fadeMs <= 0) {
      try {
        loop.source.stop();
      } catch {
        // already stopped
      }
      loop.source.disconnect();
      loop.gain.disconnect();
      return;
    }

    const now = this.context.currentTime;
    loop.gain.gain.cancelScheduledValues(now);
    loop.gain.gain.setValueAtTime(loop.gain.gain.value, now);
    loop.gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);

    setTimeout(() => {
      try {
        loop.source.stop();
      } catch {
        // already stopped
      }
      loop.source.disconnect();
      loop.gain.disconnect();
    }, fadeMs + 50);
  }

  playSfx(id: string): number {
    return this.playSfxAt(id, this.listener.x, this.listener.y, true);
  }

  playSfxAt(
    id: string,
    tileX: number,
    tileY: number,
    atListener = false
  ): number {
    void this.ensureBuffer(id, 'sfx').then((buffer) => {
      if (!buffer) {
        return;
      }
      this.playSfxBuffer(buffer, tileX, tileY, atListener);
    });
    return 0;
  }

  private playSfxBuffer(
    buffer: AudioBuffer,
    tileX: number,
    tileY: number,
    atListener: boolean
  ): number {
    if (!this.context || !this.trackGains.sfx) {
      return 0;
    }

    this.trimSfxPool();

    const ctx = this.context;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    source.buffer = buffer;
    source.connect(gain);
    gain.connect(panner);
    panner.connect(this.trackGains.sfx);

    const masterSfx = this.getEffectiveTrackVolume('sfx');
    const mix = atListener
      ? { gain: masterSfx, pan: 0 }
      : computeSpatialMix(tileX, tileY, this.listener, masterSfx);

    gain.gain.value = mix.gain;
    panner.pan.value = mix.pan;

    const instanceId = nextSfxInstanceId++;
    source.start(0);

    const instance: SfxInstance = { id: instanceId, source, gain, panner };
    this.sfxInstances.set(instanceId, instance);

    source.onended = () => {
      this.sfxInstances.delete(instanceId);
      source.disconnect();
      gain.disconnect();
      panner.disconnect();
    };

    return instanceId;
  }

  playUiSfx(id: string): number {
    void this.ensureBuffer(id, 'sfx').then((buffer) => {
      if (!buffer || !this.context || !this.trackGains.ui) {
        return;
      }

      const ctx = this.context;
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();

      source.buffer = buffer;
      source.connect(gain);
      gain.connect(this.trackGains.ui!);
      gain.gain.value = this.getEffectiveTrackVolume('ui');
      source.start(0);

      source.onended = () => {
        source.disconnect();
        gain.disconnect();
      };
    });

    return 0;
  }

  private trimSfxPool(): void {
    if (this.sfxInstances.size < MAX_SFX_INSTANCES) {
      return;
    }

    const oldest = this.sfxInstances.keys().next().value;
    if (oldest === undefined) {
      return;
    }

    const instance = this.sfxInstances.get(oldest);
    if (instance) {
      try {
        instance.source.stop();
      } catch {
        // already stopped
      }
      this.sfxInstances.delete(oldest);
    }
  }

  private getEffectiveTrackVolume(track: AudioTrack): number {
    if (this.prefs.muted[track]) {
      return 0;
    }
    return this.prefs[track];
  }

  private applyPrefs(): void {
    for (const track of ['music', 'ambient', 'sfx', 'ui'] as AudioTrack[]) {
      this.applyTrackGain(track);
    }
  }

  private applyTrackGain(track: AudioTrack): void {
    const gainNode = this.trackGains[track];
    if (!gainNode || !this.context) {
      return;
    }

    gainNode.gain.value = this.getEffectiveTrackVolume(track);
  }

  private ensureContext(): AudioContext | null {
    return this.initContext();
  }
}
