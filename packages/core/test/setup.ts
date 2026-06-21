import Module from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coreDist = path.resolve(__dirname, '../dist');

type ResolveFilename = (
  request: string,
  parent: Module | undefined,
  isMain: boolean,
  options?: unknown,
) => string;

const moduleHost = Module as typeof Module & {
  _resolveFilename: ResolveFilename;
};

const mapRequest = (request: string) => {
  if (request === '@bao/core') {
    return path.join(coreDist, 'index.js');
  }

  if (!request.startsWith('@bao/core/')) {
    return null;
  }

  const relative = request.slice('@bao/core/'.length);
  const base = path.join(coreDist, relative);

  if (fs.existsSync(base)) {
    return base;
  }

  if (fs.existsSync(`${base}.js`)) {
    return `${base}.js`;
  }

  return `${base}.js`;
};

const originalResolveFilename = moduleHost._resolveFilename;
moduleHost._resolveFilename = function (
  request: string,
  parent: Module | undefined,
  isMain: boolean,
  options?: unknown,
) {
  const mapped = mapRequest(request);
  if (mapped) {
    return originalResolveFilename.call(this, mapped, parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
