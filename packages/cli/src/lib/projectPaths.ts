import fs from "fs";
import path from "path";

import { findMonorepoRoot } from "@bao/env";

export interface ProjectPaths {
  publicDir: string;
  seedsDir: string;
  datsDir: string;
  mapsMetaDir: string;
  mapsInputDir: string;
  mapsOutputDir: string;
  initDir: string;
}

export function resolveProjectPaths(startDir?: string): ProjectPaths {
  const cwd = path.resolve(startDir ?? process.cwd());

  try {
    const monorepoRoot = findMonorepoRoot(cwd);
    const assetsPublic = path.join(monorepoRoot, "packages/assets/public");
    const assetsSeeds = path.join(monorepoRoot, "packages/assets/seeds");

    if (fs.existsSync(assetsPublic)) {
      return {
        publicDir: assetsPublic,
        seedsDir: assetsSeeds,
        datsDir: path.join(assetsPublic, "dats"),
        mapsMetaDir: path.join(assetsPublic, "maps"),
        mapsInputDir: path.join(assetsPublic, "maps", "old"),
        mapsOutputDir: path.join(assetsPublic, "maps"),
        initDir: path.join(assetsPublic, "init"),
      };
    }
  } catch {
    // Not inside the bao monorepo — fall back to cwd conventions.
  }

  const publicDir = path.join(cwd, "public");

  return {
    publicDir,
    seedsDir: path.join(cwd, "seeds"),
    datsDir: path.join(publicDir, "dats"),
    mapsMetaDir: path.join(publicDir, "maps"),
    mapsInputDir: path.join(publicDir, "maps", "old"),
    mapsOutputDir: path.join(publicDir, "maps"),
    initDir: path.join(publicDir, "init"),
  };
}
