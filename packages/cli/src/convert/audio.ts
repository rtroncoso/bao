import fs from "fs";
import path from "path";

import { formatSpawnFailure, runTool } from "../lib/spawnTool.js";
import {
  DEFAULT_SOUND_FONT_NAME,
  findSoundFont,
  soundFontSearchSummary,
} from "../lib/soundFont.js";
import type { ConvertAudioOptions } from "../types.js";

const parseIdList = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const listNumericIds = (dirPath: string, extension: string) => {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const pattern = new RegExp(`^(\\d+)\\.${extension}$`, "i");
  return fs
    .readdirSync(dirPath)
    .map((fileName) => {
      const match = fileName.match(pattern);
      return match ? match[1] : null;
    })
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => Number(left) - Number(right));
};

const listNamedWavs = (wavDir: string) => {
  if (!fs.existsSync(wavDir)) {
    return [];
  }

  return fs
    .readdirSync(wavDir)
    .filter((fileName) => /\.wav$/i.test(fileName))
    .map((fileName) => fileName.replace(/\.wav$/i, ""))
    .filter((baseName) => !/^\d+$/.test(baseName))
    .sort((left, right) => left.localeCompare(right));
};

export const discoverAllAudio = (sourceDir: string) => {
  const midiIds = listNumericIds(path.join(sourceDir, "MIDI"), "mid");
  const mp3Ids = listNumericIds(path.join(sourceDir, "MP3"), "mp3");
  const music = [...new Set([...midiIds, ...mp3Ids])].sort(
    (left, right) => Number(left) - Number(right)
  );

  return {
    music,
    sfx: listNumericIds(path.join(sourceDir, "WAV"), "wav"),
    ui: listNamedWavs(path.join(sourceDir, "WAV")),
  };
};

const ensureDir = (dirPath: string) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const copyFile = (
  sourcePath: string,
  destPath: string,
  dryRun: boolean,
  debug: boolean
) => {
  if (dryRun) {
    if (debug) {
      console.log(`[bao] would copy ${sourcePath} → ${destPath}`);
    }
    return;
  }

  ensureDir(path.dirname(destPath));
  fs.copyFileSync(sourcePath, destPath);
};

const findWavFile = (wavDir: string, id: string) => {
  const candidates = [`${id}.wav`, `${id}.Wav`, `${id}.WAV`];
  for (const name of candidates) {
    const filePath = path.join(wavDir, name);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
};

const findUiWav = (wavDir: string, name: string) => {
  const candidates = [`${name}.wav`, `${name}.Wav`, `${name}.WAV`];
  for (const fileName of candidates) {
    const filePath = path.join(wavDir, fileName);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
};

const convertMidiToOgg = ({
  midiPath,
  oggPath,
  soundFont,
  dryRun,
  debug,
  warnedFluidsynth,
  warnedFfmpeg,
}: {
  midiPath: string;
  oggPath: string;
  soundFont: string | null;
  dryRun: boolean;
  debug: boolean;
  warnedFluidsynth: { value: boolean };
  warnedFfmpeg: { value: boolean };
}): boolean | "ogg" | "mp3" => {
  const wavPath = oggPath.replace(/\.ogg$/i, ".wav");

  if (dryRun) {
    if (debug) {
      console.log(`[bao] would convert MIDI ${midiPath} → ${oggPath}`);
    }
    return true;
  }

  ensureDir(path.dirname(oggPath));

  if (!soundFont) {
    return false;
  }

  const fluidsynthArgs = [
    "-ni",
    "-q",
    "-r",
    "44100",
    "-F",
    wavPath,
    soundFont,
    midiPath,
  ];
  const { executable: fluidsynthExe, result: fluidsynth } = runTool(
    "fluidsynth",
    fluidsynthArgs,
    { debug }
  );
  const rendered = fs.existsSync(wavPath) && fs.statSync(wavPath).size > 0;

  if (!rendered) {
    if (!warnedFluidsynth.value) {
      console.warn(
        `[bao] fluidsynth failed for ${midiPath}\n${formatSpawnFailure(
          fluidsynthExe,
          fluidsynthArgs,
          fluidsynth
        )}`
      );
      warnedFluidsynth.value = true;
    }
    return false;
  }

  const mp3Path = oggPath.replace(/\.ogg$/i, ".mp3");
  const ffmpegArgs = [
    "-y",
    "-i",
    wavPath,
    "-c:a",
    "libvorbis",
    "-q:a",
    "6",
    oggPath,
  ];
  let { executable: ffmpegExe, result: ffmpeg } = runTool(
    "ffmpeg",
    ffmpegArgs,
    {
      debug,
    }
  );

  if (ffmpeg.status !== 0) {
    const mp3Args = [
      "-y",
      "-i",
      wavPath,
      "-codec:a",
      "libmp3lame",
      "-qscale:a",
      "4",
      mp3Path,
    ];
    ({ executable: ffmpegExe, result: ffmpeg } = runTool("ffmpeg", mp3Args, {
      debug,
    }));

    if (ffmpeg.status === 0 && fs.existsSync(mp3Path)) {
      if (fs.existsSync(wavPath)) {
        fs.unlinkSync(wavPath);
      }
      return "mp3";
    }

    if (!warnedFfmpeg.value) {
      console.warn(
        `[bao] ffmpeg failed for ${midiPath}\n${formatSpawnFailure(
          ffmpegExe,
          mp3Args,
          ffmpeg
        )}`
      );
      warnedFfmpeg.value = true;
    }
    if (fs.existsSync(wavPath)) {
      fs.unlinkSync(wavPath);
    }
    return false;
  }

  if (fs.existsSync(wavPath)) {
    fs.unlinkSync(wavPath);
  }

  return "ogg";
};

const updateAudioManifest = (
  manifestPath: string,
  audioEntries: {
    music?: Record<string, string>;
    sfx?: Record<string, string>;
  },
  dryRun: boolean
) => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    audio?: {
      music?: Record<string, string>;
      sfx?: Record<string, string>;
      overrides?: string;
    };
  };
  manifest.audio = manifest.audio ?? {};

  if (audioEntries.music) {
    manifest.audio.music = {
      ...(manifest.audio.music ?? {}),
      ...audioEntries.music,
    };
  }

  if (audioEntries.sfx) {
    manifest.audio.sfx = {
      ...(manifest.audio.sfx ?? {}),
      ...audioEntries.sfx,
    };
  }

  if (!manifest.audio.overrides) {
    manifest.audio.overrides = "audio/overrides/";
  }

  if (!dryRun) {
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
};

export const convertAudio = async (options: ConvertAudioOptions) => {
  const {
    sourceDir,
    publicDir = path.join(process.cwd(), "public"),
    music = [],
    sfx = [],
    ui = [],
    all = false,
    dryRun = false,
    debug = false,
  } = options;

  if (!sourceDir) {
    throw new Error(
      "No legacy audio source — copy AO WAV/, MIDI/, and MP3/ into public/audio/legacy/ or pass --source"
    );
  }

  if (!fs.existsSync(sourceDir)) {
    throw new Error(
      `Legacy audio source not found: ${sourceDir} (copy AO WAV/, MIDI/, and MP3/ there or pass --source)`
    );
  }

  let musicIds = music;
  let sfxIds = sfx;
  let uiNames = ui;

  if (all) {
    const discovered = discoverAllAudio(sourceDir);
    musicIds = discovered.music;
    sfxIds = discovered.sfx;
    uiNames = discovered.ui;

    if (debug) {
      console.log(
        `[bao] discovered ${musicIds.length} music, ${sfxIds.length} sfx, ${uiNames.length} ui from ${sourceDir}`
      );
    }
  }

  if (!musicIds.length && !sfxIds.length && !uiNames.length) {
    throw new Error(
      "No audio to convert — pass --all or --music/--sfx/--ui id lists"
    );
  }

  const wavDir = path.join(sourceDir, "WAV");
  const midiDir = path.join(sourceDir, "MIDI");
  const mp3Dir = path.join(sourceDir, "MP3");

  const audioRoot = path.join(publicDir, "audio");
  const musicOut = path.join(audioRoot, "music");
  const sfxFootstepsOut = path.join(audioRoot, "sfx", "footsteps");
  const sfxAmbientOut = path.join(audioRoot, "sfx", "ambient");
  const sfxUiOut = path.join(audioRoot, "sfx", "ui");

  const manifestMusic: Record<string, string> = {};
  const manifestSfx: Record<string, string> = {};
  const soundFont = findSoundFont({ legacyDir: sourceDir });
  let warnedNoSoundFont = false;
  const warnedFluidsynth = { value: false };
  const warnedFfmpeg = { value: false };

  for (const id of musicIds) {
    const midiPath = path.join(midiDir, `${id}.mid`);
    const mp3Path = path.join(mp3Dir, `${id}.mp3`);
    const oggDest = path.join(musicOut, `${id}.ogg`);
    const mp3Dest = path.join(musicOut, `${id}.mp3`);

    if (fs.existsSync(mp3Path)) {
      copyFile(mp3Path, mp3Dest, dryRun, debug);
      manifestMusic[id] = `audio/music/${id}.mp3`;
    } else if (fs.existsSync(midiPath)) {
      if (!soundFont && !dryRun) {
        if (!warnedNoSoundFont) {
          console.warn(
            `[bao] skipping MIDI conversion: place ${DEFAULT_SOUND_FONT_NAME} in the legacy audio folder or set BAO_SOUND_FONT`
          );
          if (debug) {
            console.warn(soundFontSearchSummary({ legacyDir: sourceDir }));
          }
          warnedNoSoundFont = true;
        }
      } else {
        const converted = convertMidiToOgg({
          midiPath,
          oggPath: oggDest,
          soundFont,
          dryRun,
          debug,
          warnedFluidsynth,
          warnedFfmpeg,
        });
        if (converted === "ogg" || dryRun) {
          manifestMusic[id] = `audio/music/${id}.ogg`;
        } else if (converted === "mp3") {
          manifestMusic[id] = `audio/music/${id}.mp3`;
        }
      }
    } else {
      console.warn(`[bao] music id ${id}: no .mid or .mp3 in source`);
    }
  }

  const footstepIds = new Set(["23", "24"]);
  for (const id of sfxIds) {
    const wavSource = findWavFile(wavDir, id);
    if (!wavSource) {
      console.warn(`[bao] sfx id ${id}: WAV not found in ${wavDir}`);
      continue;
    }

    const destDir = footstepIds.has(id) ? sfxFootstepsOut : sfxAmbientOut;
    const destPath = path.join(destDir, `${id}.wav`);
    copyFile(wavSource, destPath, dryRun, debug);

    const relativeDir = footstepIds.has(id)
      ? "audio/sfx/footsteps"
      : "audio/sfx/ambient";
    manifestSfx[id] = `${relativeDir}/${id}.wav`;
  }

  for (const name of uiNames) {
    const wavSource = findUiWav(wavDir, name);
    if (!wavSource) {
      console.warn(`[bao] ui sound ${name}: WAV not found in ${wavDir}`);
      continue;
    }

    const destPath = path.join(sfxUiOut, `${name}.wav`);
    copyFile(wavSource, destPath, dryRun, debug);
    manifestSfx[name] = `audio/sfx/ui/${name}.wav`;
  }

  if (!dryRun) {
    ensureDir(path.join(audioRoot, "overrides"));
  }

  updateAudioManifest(
    path.join(publicDir, "manifest.json"),
    { music: manifestMusic, sfx: manifestSfx },
    dryRun
  );

  return {
    music: Object.keys(manifestMusic),
    sfx: Object.keys(manifestSfx),
  };
};
