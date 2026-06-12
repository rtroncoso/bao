const Module = require('module');
const fs = require('fs');
const path = require('path');

const coreDist = path.resolve(__dirname, '../dist');

const mapRequest = (request) => {
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

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  const mapped = mapRequest(request);
  if (mapped) {
    return originalResolveFilename.call(this, mapped, parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
