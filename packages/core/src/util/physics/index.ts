import { Physics as BumpPhysics } from '@lcluber/bumpjs';
export interface CreateBodyParameters {
  x: number;
  y: number;
  width: number;
  height: number;
  mass?: number;
  damping?: number;
  restitution?: number;
  type?: ShapeTypes;
}

export const Shapes = {
  CIRCLE: 'circle',
  RECTANGLE: 'rectangle',
}

export type ShapeTypes =
  | typeof Shapes.CIRCLE
  | typeof Shapes.RECTANGLE;

export const createBody = ({
  x,
  y,
  width,
  height,
  mass = 0.0,
  damping = 1.0,
  restitution = 0.0,
  type = Shapes.RECTANGLE
}) => new BumpPhysics(
  x,
  y,
  0,
  0,
  width,
  height,
  mass,
  damping,
  restitution,
  type
);

export const createRectangle = ({
  type = Shapes.RECTANGLE,
  ...props
}: CreateBodyParameters) => (
  createBody({ ...props, type })
);

export const createCircle = ({
  type = Shapes.CIRCLE,
  ...props
}: CreateBodyParameters) => (
  createBody({ ...props, type })
);
