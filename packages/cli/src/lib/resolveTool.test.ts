import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";

import { clearToolCommandCache, resolveToolCommand } from "./resolveTool.js";

describe("resolveToolCommand", () => {
  const previousPath = process.env.PATH;

  afterEach(() => {
    if (previousPath === undefined) {
      delete process.env.PATH;
    } else {
      process.env.PATH = previousPath;
    }
    clearToolCommandCache();
  });

  it("resolves a tool from a directory on PATH", () => {
    const binDir = fs.mkdtempSync(path.join(os.tmpdir(), "bao-bin-"));
    const toolPath = path.join(binDir, "fake-tool.exe");
    fs.writeFileSync(toolPath, "");

    process.env.PATH = binDir;
    clearToolCommandCache();

    try {
      expect(resolveToolCommand("fake-tool")).toBe(toolPath);
    } finally {
      fs.rmSync(binDir, { recursive: true, force: true });
    }
  });
});
