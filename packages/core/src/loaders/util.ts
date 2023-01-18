import filter from 'lodash/fp/filter';
import find from 'lodash/fp/find';
import values from 'lodash/fp/values';

import {
  EAST, HEADINGS, NORTH, SOUTH, WEST,
} from '@mob/core/constants/game';
import { Graphic } from '@mob/core/models/data/shared';
import { JsonGraphicState } from './graphics';

/**
 * Adds extension to fileName
 */
export const getGraphicsFileName = (fileName: string | number) => (
  `${fileName}.png`
);

/**
 * Converts file name to absolute texture path
 */
export const getGraphicsFilePath = (fileName: string | number) => (
  `${getGraphicsFileName(fileName)}`
);

/**
 * Extrapolates from INI data `key` formatted using `keyFormat`
 */
export const parseKey = (key: string = '', keyFormat: RegExp = /[^0-9.]/g) => (
  key.replace(keyFormat, '')
);

export interface FindAnimationParameters {
  animations: Graphic[];
  id: string | number;
}

/**
 * Finds an animation by `id` property in an animations array
 */
export const findAnimation = ({
  animations,
  id
}: FindAnimationParameters) => (
  find((animation: Graphic) => animation.id === id)(animations)
);

export interface FindGraphicParameters {
  graphics: JsonGraphicState;
  id: string | number;
}
/**
 * Finds a graphic by `id` property in a graphics object
 */
export const findGraphic = ({
  graphics,
  id
}: FindGraphicParameters) => (
  graphics[id]
);

export interface FindGraphicsByFileNameParameters {
  fileName: string | number;
  graphics: JsonGraphicState;
}

/**
 * Finds a graphic by `fileName` property in a graphics object
 */
export const findGraphicsByFileName = ({
  fileName,
  graphics
}: FindGraphicsByFileNameParameters) => (
  filter((graphic: Graphic) => graphic.fileName === fileName)(values(graphics))
);

/** Default animation parsing order */
export const defaultOrder = [NORTH, WEST, SOUTH, EAST].map(h => HEADINGS[h]);

export interface ParseDirectionGraphicWrapper {
  graphics: JsonGraphicState;
  Model: any;
  order?: string[];
}

export interface DirectionGraphicData {
  id: string | number;
  up: string | number;
  left: string | number;
  down: string | number;
  right: string | number;
}

/**
 * Given a map of `graphics` and a `model`, it
 * will create a `model` instance from `props`, with
 * mapped references for cardinal directions from
 * the `graphics` map. Provides a generator function
 * for use with the {@link reduce} method
 */
export const parseDirectionGraphicByModel = <D extends DirectionGraphicData, S>({
  graphics,
  Model,
  order = defaultOrder
}: ParseDirectionGraphicWrapper) => (
  (state: S, data: D) => {
    const {
      id,
      up,
      left,
      down,
      right,
    } = data;

    const [north, west, south, east] = order;
    state[id] = new Model({
      ...data,
      [north]: findGraphic({ graphics, id: up }),
      [west]: findGraphic({ graphics, id: left }),
      [south]: findGraphic({ graphics, id: down }),
      [east]: findGraphic({ graphics, id: right }),
    });

    return state;
  }
);

export interface ParseDirectionAnimationWrapper {
  animations: Graphic[];
  Model: any;
  order?: string[];
}

export interface DirectionAnimationData {
  id: string | number;
  up: string | number;
  left: string | number;
  down: string | number;
  right: string | number;
}

/**
 * Given an array of `animations` and a `model`, it
 * will create a `model` instance from `props`, with
 * mapped references for cardinal directions from
 * the `animations` array. Provides a generator
 * function for use with the {@link reduce} method
 */
export const parseDirectionAnimationByModel = <D extends DirectionAnimationData, S>({
  animations,
  Model,
  order = defaultOrder
}: ParseDirectionAnimationWrapper) => (
  (state: S, data: D) => {
    const {
      down,
      id,
      left,
      right,
      up,
    } = data;

    const [north, west, south, east] = order;
    state[id] = new Model({
      ...data,
      [north]: findAnimation({ animations, id: up }),
      [west]: findAnimation({ animations, id: left }),
      [south]: findAnimation({ animations, id: down}),
      [east]: findAnimation({ animations, id: right }),
    });

    return state;
  }
);
