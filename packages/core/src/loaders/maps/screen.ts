import { TILE_SIZE } from '@bao/core/constants/game/Map';
import { getDimensions } from '@bao/core/loaders/graphics/util';
import { Graphic } from '@bao/core/models';

export interface ScreenPosition {
  x: number;
  y: number;
}

/** Pixel offsets from tile anchor (center-bottom) to sprite top-left. */
export const tileAnchorOffsets = (width: number, height: number) => ({
  offsetX: (width - TILE_SIZE) / 2,
  offsetY: height - TILE_SIZE,
});

/**
 * Graphic used for placement dimensions — first animation frame when present,
 * matching {@link parseJsonTile} / TMX bake.
 */
export const resolvePlacementGraphic = (
  graphic?: Graphic | null
): Graphic | null => {
  if (!graphic) {
    return null;
  }

  const [firstFrame] = graphic.frames ?? [];
  if (firstFrame instanceof Graphic) {
    return firstFrame;
  }

  return graphic;
};

/**
 * Convert world tile coords to top-left pixel position for Pixi (anchor 0,0).
 * Tile `(x, y)` is the center-bottom anchor; offsets come from graphic size.
 * Matches TMX `makeRect` property `x`/`y` and baked sprite placement.
 */
export const tileCoordsToScreen = (
  x: number,
  y: number,
  graphic?: Graphic | null
): ScreenPosition => {
  const placementGraphic = resolvePlacementGraphic(graphic);
  if (!placementGraphic) {
    return { x: x * TILE_SIZE, y: y * TILE_SIZE };
  }

  const { offsetX, offsetY } = getDimensions(placementGraphic);
  return {
    x: x * TILE_SIZE - offsetX,
    y: y * TILE_SIZE - offsetY,
  };
};

/**
 * Same placement math without loading textures (for tests / pure math).
 */
export const tileCoordsToScreenFromSize = (
  x: number,
  y: number,
  width: number,
  height: number
): ScreenPosition => {
  const { offsetX, offsetY } = tileAnchorOffsets(width, height);
  return {
    x: x * TILE_SIZE - offsetX,
    y: y * TILE_SIZE - offsetY,
  };
};
