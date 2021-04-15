import { getGraphicsFilePath, parseKey } from '@mob/core/loaders';
import { TexturedGraphic } from '@mob/core/models';

import map from 'lodash/fp/map';
import mapKeys from 'lodash/fp/mapKeys';
// import reduce from 'lodash/fp/reduce';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';

export interface ParseIniGraphicState {
  [key: string]: TexturedGraphic;
}

/**
 * Parses animation frames by getting `Graphic` model
 * reference from the `reducer`
 */
export const parseAnimations = (state: ParseIniGraphicState) => (
  map((graphic: string) => state[graphic])
);

/**
 * Argentum GRH INI Parsing format:
 *
 * @remarks
 * Static GRH:
 *   `{numFrames}-{fileName}-{x}-{y}-{width}-{height}`
 * Animation:
 *   `{numFrames}-{grh1}-{grh2}-{grh3}-...-{grhN}-{speed}`
 */
export const parseIniGraphic = (
  state: ParseIniGraphicState,
  graphicsString: string,
  id: string
): ParseIniGraphicState => {
  const props = graphicsString.split('-');
  const numFrames = parseInt(props.shift(), 10);

  if (numFrames > 1) {
    const speed = parseInt(props.pop(), 10) / 1800;
    const frames = parseAnimations(state)(props);
    state[id] = new TexturedGraphic({
      id,
      frames,
      speed,
    });

    return state;
  }

  const [fileName, x, y, width, height] = props;
  const path = getGraphicsFilePath(fileName);

  state[id] = new TexturedGraphic({
    id,
    path,
    fileName,
    x: parseInt(x, 10),
    y: parseInt(y, 10),
    width: parseInt(width, 10),
    height: parseInt(height, 10)
  });

  return state;
};

/**
 * Parses INI graphics file `file` into a key-value
 * map of graphic id's and their respective `Graphic`
 * models
 */
export const getIniGraphics = (file: string, key: string = 'Graphics') => {
  const data = get(key, file);

  return flow(
    mapKeys(parseKey),
    // reduce(parseIniGraphic)
  )(data);
};
