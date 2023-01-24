import { PixiComponent } from '@inlet/react-pixi';
import { Graphics } from 'pixi.js';

export interface RectangleProps {
  x?: number;
  y?: number;
  width: number;
  height: number;
  color: number;
}

export const Rectangle = PixiComponent<RectangleProps, Graphics>('Rectangle', {
  create: () => new Graphics(),
  applyProps: (ins, _, props) => {
    ins.x = props.x || 0;
    ins.y = props.y || 0;
    ins.clear();
    ins.beginFill(props.color);
    ins.drawRect(ins.x, ins.y, props.width, props.height);
    ins.endFill();
  }
});
