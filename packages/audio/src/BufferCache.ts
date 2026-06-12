export class BufferCache {
  private readonly buffers = new Map<string, AudioBuffer>();
  private readonly inFlight = new Map<string, Promise<AudioBuffer | undefined>>();

  get(id: string): AudioBuffer | undefined {
    return this.buffers.get(id);
  }

  has(id: string): boolean {
    return this.buffers.has(id);
  }

  set(id: string, buffer: AudioBuffer): void {
    this.buffers.set(id, buffer);
  }

  /** Fetch and decode a single asset; dedupes concurrent requests for the same id. */
  async ensure(
    id: string,
    relativePath: string,
    context: AudioContext,
    resolveUrl: (path: string) => string
  ): Promise<AudioBuffer | undefined> {
    const cached = this.buffers.get(id);
    if (cached) {
      return cached;
    }

    const pending = this.inFlight.get(id);
    if (pending) {
      return pending;
    }

    const load = (async () => {
      try {
        const url = resolveUrl(relativePath);
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`[audio] failed to load ${id} from ${url}`);
          return undefined;
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        this.buffers.set(id, audioBuffer);
        return audioBuffer;
      } catch (error) {
        console.warn(`[audio] decode failed for ${id}`, error);
        return undefined;
      } finally {
        this.inFlight.delete(id);
      }
    })();

    this.inFlight.set(id, load);
    return load;
  }

  /** Warm the cache for specific ids (e.g. current map music + ambient sfx). */
  async prefetch(
    context: AudioContext,
    entries: Record<string, string>,
    ids: string[],
    resolveUrl: (path: string) => string
  ): Promise<void> {
    await Promise.all(
      ids
        .filter((id) => entries[id])
        .map((id) => this.ensure(id, entries[id], context, resolveUrl))
    );
  }
}
