import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

import { resolveProjectPaths } from "./projectPaths.js";

describe("resolveProjectPaths", () => {
  it("defaults to monorepo assets when packages/assets/public exists", () => {
    const repoRoot = path.resolve(import.meta.dirname, "../../../../");
    const paths = resolveProjectPaths(repoRoot);

    expect(paths.publicDir).toBe(path.join(repoRoot, "packages/assets/public"));
    expect(paths.seedsDir).toBe(path.join(repoRoot, "packages/assets/seeds"));
    expect(paths.datsDir).toBe(
      path.join(repoRoot, "packages/assets/public/dats")
    );
  });

  it("falls back to cwd/public outside the monorepo layout", () => {
    const tempDir = fs.mkdtempSync(
      path.join(fs.realpathSync("/tmp"), "bao-cli-")
    );
    try {
      const paths = resolveProjectPaths(tempDir);
      expect(paths.publicDir).toBe(path.join(tempDir, "public"));
      expect(paths.seedsDir).toBe(path.join(tempDir, "seeds"));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
