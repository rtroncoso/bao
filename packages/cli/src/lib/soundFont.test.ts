import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";

import {
  DEFAULT_SOUND_FONT_NAME,
  expandHome,
  findSoundFont,
} from "./soundFont.js";

describe("expandHome", () => {
  it("expands ~/ paths to the user home directory", () => {
    expect(expandHome("~/Downloads/gm.sf2")).toBe(
      path.join(os.homedir(), "Downloads", "gm.sf2")
    );
  });

  it("expands ~\\ paths on Windows-style input", () => {
    expect(expandHome("~\\Downloads\\gm.sf2")).toBe(
      path.join(os.homedir(), "Downloads", "gm.sf2")
    );
  });

  it("leaves absolute paths unchanged", () => {
    const absolute = path.join(os.homedir(), "Downloads", "gm.sf2");
    expect(expandHome(absolute)).toBe(absolute);
  });
});

describe("findSoundFont", () => {
  const previous = process.env.BAO_SOUND_FONT;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.BAO_SOUND_FONT;
    } else {
      process.env.BAO_SOUND_FONT = previous;
    }
  });

  it("finds gm.sf2 in the legacy audio directory", () => {
    delete process.env.BAO_SOUND_FONT;

    const legacyDir = fs.mkdtempSync(path.join(os.tmpdir(), "bao-audio-"));
    const soundFontPath = path.join(legacyDir, DEFAULT_SOUND_FONT_NAME);
    fs.writeFileSync(soundFontPath, "sf2");

    try {
      expect(findSoundFont({ legacyDir })).toBe(soundFontPath);
    } finally {
      fs.rmSync(legacyDir, { recursive: true, force: true });
    }
  });

  it("prefers BAO_SOUND_FONT over the legacy default", () => {
    const legacyDir = fs.mkdtempSync(path.join(os.tmpdir(), "bao-audio-"));
    const customDir = fs.mkdtempSync(path.join(os.tmpdir(), "bao-custom-"));
    const legacyFont = path.join(legacyDir, DEFAULT_SOUND_FONT_NAME);
    const customFont = path.join(customDir, "custom.sf2");

    fs.writeFileSync(legacyFont, "sf2");
    fs.writeFileSync(customFont, "sf2");
    process.env.BAO_SOUND_FONT = customFont;

    try {
      expect(findSoundFont({ legacyDir })).toBe(customFont);
    } finally {
      fs.rmSync(legacyDir, { recursive: true, force: true });
      fs.rmSync(customDir, { recursive: true, force: true });
    }
  });
});
