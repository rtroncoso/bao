import Module from "node:module";
import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cliRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const coreDist = path.resolve(cliRoot, "../core/dist");

type ResolveFilename = (
  request: string,
  parent: Module | undefined,
  isMain: boolean,
  options?: unknown
) => string;

const moduleHost = Module as typeof Module & {
  _resolveFilename: ResolveFilename;
};

const ensureCoreBuilt = () => {
  const indexPath = path.join(coreDist, "index.js");
  if (!fs.existsSync(indexPath)) {
    throw new Error(
      "@bao/core is not built. Run: pnpm --filter @bao/core build"
    );
  }
};

const mapRequest = (request: string) => {
  if (request === "@bao/core") {
    return path.join(coreDist, "index.js");
  }

  if (!request.startsWith("@bao/core/")) {
    return null;
  }

  const relative = request.slice("@bao/core/".length);
  const base = path.join(coreDist, relative);

  if (fs.existsSync(base)) {
    return base;
  }

  if (fs.existsSync(`${base}.js`)) {
    return `${base}.js`;
  }

  return `${base}.js`;
};

let registered = false;

export const registerCoreAliases = () => {
  if (registered) {
    return;
  }

  ensureCoreBuilt();

  const originalResolveFilename = moduleHost._resolveFilename;
  moduleHost._resolveFilename = function (
    request: string,
    parent: Module | undefined,
    isMain: boolean,
    options?: unknown
  ) {
    const mapped = mapRequest(request);
    if (mapped) {
      return originalResolveFilename.call(
        this,
        mapped,
        parent,
        isMain,
        options
      );
    }

    return originalResolveFilename.call(this, request, parent, isMain, options);
  };

  registered = true;
};

registerCoreAliases();
