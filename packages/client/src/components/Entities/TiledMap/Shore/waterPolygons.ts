import { Point } from 'pixi.js';
import { TmxObject } from '@bao/core';

export type WaterPolygon = Point[];

export const getWaterPolygons = (water: TmxObject[]): WaterPolygon[] =>
  water
    .filter((object) => object.polygon?.length)
    .map((object) =>
      object.polygon.map(
        (vertex) => new Point(vertex.x + object.x, vertex.y + object.y)
      )
    );
