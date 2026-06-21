import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";

import { listMapIds } from "./mapFiles.js";

describe("listMapIds", () => {
  it("finds numeric map ids from legacy filenames", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bao-maps-"));
    try {
      fs.writeFileSync(path.join(tempDir, "Mapa1.map"), "");
      fs.writeFileSync(path.join(tempDir, "mapa34.map"), "");
      fs.writeFileSync(path.join(tempDir, "Mapa1.dat"), "");
      fs.writeFileSync(path.join(tempDir, "readme.txt"), "");

      expect(listMapIds(tempDir)).toEqual([1, 34]);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
