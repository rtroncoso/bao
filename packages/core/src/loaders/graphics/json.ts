import { getGraphicsFilePath } from '@bao/core/loaders/util';
import { Graphic } from '@bao/core/models/data/shared';
import reduce from 'lodash/fp/reduce';

export interface JsonGraphicModel {
  fileName: string | number;
  height: number;
  id: string | number;
  width: number;
  x: number;
  y: number;
}

export interface AnimatedJsonGraphicModel {
  frames: Array<number>;
  id: string | number;
  speed: number;
}

export type JsonGraphicsModel = Array<number | JsonGraphicModel | AnimatedJsonGraphicModel>;

export interface JsonGraphicState {
  [key: string]: Graphic;
}

/**
 * Create a `Graphic` model instance from props and
 * add it to a reducer object for self-referencing
 * animations
 */
export const parseJsonGraphic = (
  state: JsonGraphicState,
  data: JsonGraphicModel & AnimatedJsonGraphicModel
) => {
  const { frames: animations = [], fileName, id } = data;

  if (animations.length > 0) {
    const frames = animations.map(frame => state[frame]);
    const speed = data.speed / 1800;
    state[id] = new Graphic({
      ...data,
      speed,
      frames
    });

    return state;
  }

  const path = getGraphicsFilePath(fileName);
  state[id] = new Graphic({
    ...data,
    path
  });

  return state;
};

/**
 * Parses JSON graphics file into a key-value map
 * of graphic id's and their respective `Graphic`
 */
export const getJsonGraphics = (data: JsonGraphicsModel): JsonGraphicState => (
  reduce<JsonGraphicsModel, JsonGraphicState>(parseJsonGraphic, {})(data)
);
