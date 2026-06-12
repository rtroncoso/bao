import { Point } from 'pixi.js';
import { TmxObject } from '@bao/core';

export type WaterPolygon = Point[];

const rectToPolygon = (object: TmxObject): WaterPolygon => {
  const x = object.x ?? 0;
  const y = object.y ?? 0;
  const width = object.width ?? 0;
  const height = object.height ?? 0;

  return [
    new Point(x, y),
    new Point(x + width, y),
    new Point(x + width, y + height),
    new Point(x, y + height)
  ];
};

export const getWaterPolygons = (water: TmxObject[]): WaterPolygon[] =>
  water.flatMap((object) => {
    if (object.polygon?.length) {
      const originX = object.x ?? 0;
      const originY = object.y ?? 0;

      return [
        object.polygon.map(
          (vertex) => new Point(vertex.x + originX, vertex.y + originY)
        )
      ];
    }

    if (object.width > 0 && object.height > 0) {
      return [rectToPolygon(object)];
    }

    return [];
  });
