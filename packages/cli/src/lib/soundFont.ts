import fs from "fs";
import os from "os";
import path from "path";

export const DEFAULT_SOUND_FONT_NAME = "gm.sf2";

/** Expand a leading `~` or `~/` / `~\` to the user home directory. */
export const expandHome = (filePath: string) => {
  if (!filePath.startsWith("~")) {
    return filePath;
  }

  if (filePath === "~") {
    return os.homedir();
  }

  const rest = filePath.slice(1).replace(/^[/\\]+/, "");
  return path.join(os.homedir(), rest);
};

const resolveExistingPath = (candidate: string): string | null => {
  const resolved = path.resolve(expandHome(candidate));
  return fs.existsSync(resolved) ? resolved : null;
};

export interface SoundFontSearchOptions {
  legacyDir?: string;
}

const buildCandidates = ({ legacyDir }: SoundFontSearchOptions = {}) => {
  const candidates: string[] = [];

  if (process.env.BAO_SOUND_FONT) {
    candidates.push(process.env.BAO_SOUND_FONT);
  }

  if (legacyDir) {
    candidates.push(path.join(legacyDir, DEFAULT_SOUND_FONT_NAME));
  }

  return candidates;
};

export const findSoundFont = (
  options: SoundFontSearchOptions = {}
): string | null => {
  for (const candidate of buildCandidates(options)) {
    const resolved = resolveExistingPath(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return null;
};

export const soundFontSearchSummary = (
  options: SoundFontSearchOptions = {}
): string => {
  const parts = ["Checked:"];

  for (const candidate of buildCandidates(options)) {
    parts.push(`  ${candidate}`);
    parts.push(`    → ${path.resolve(expandHome(candidate))}`);
  }

  if (!parts.length) {
    parts.push("  (no candidates)");
  }

  return parts.join("\n");
};
