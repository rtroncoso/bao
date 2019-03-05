import { Physics as BumpPhysics } from '@lcluber/bumpjs';

export const RECTANGLE = 'rectangle';
export const CIRCLE = 'circle';

export const createBody = ({
  x,
  y,
  width,
  height,
  mass = 0.0,
  damping = 1.0,
  restitution = 0.0,
  type = RECTANGLE
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

export const createRectangle = ({ type = RECTANGLE, ...props }) => createBody({ ...props, type });
export const createCircle = ({ type = CIRCLE, ...props }) => createBody({ ...props, type });

export default null;
