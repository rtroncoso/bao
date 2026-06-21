import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let patched = false;

const stubTexture = () => ({
  width: 32,
  height: 32,
  baseTexture: { scaleMode: 0 },
});

export const patchPixiForHeadless = () => {
  if (patched) {
    return;
  }

  if (typeof globalThis.HTMLImageElement === "undefined") {
    globalThis.HTMLImageElement =
      class HTMLImageElement {} as typeof HTMLImageElement;
  }

  if (typeof globalThis.Image === "undefined") {
    globalThis.Image = class Image {} as typeof Image;
  }

  const pixi = require("pixi.js") as { Texture?: { from: unknown } };
  if (pixi?.Texture) {
    pixi.Texture.from = stubTexture;
  }

  patched = true;
};
