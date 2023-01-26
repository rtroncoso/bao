import { PixiComponent } from '@inlet/react-pixi';
import { Graphics } from 'pixi.js';

export interface RectangleProps {
  anchor?: [number, number];
  x?: number;
  y?: number;
  width: number;
  height: number;
  color: number;
  lineWidth?: number;
  lineColor?: number;
}

export const Rectangle = PixiComponent<RectangleProps, Graphics>('Rectangle', {
  create: () => new Graphics(),
  applyProps: (ins, _, props) => {
    const { anchor = [], lineWidth = 1, lineColor = 0xfff } = props;
    const [pivotX = 0, pivotY = 0] = anchor;
    ins.x = props.x || 0;
    ins.y = props.y || 0;
    ins.pivot.x = pivotX;
    ins.pivot.y = pivotY;
    ins.clear();
    ins.beginFill(props.color);
    ins.lineStyle(lineWidth, lineColor);
    ins.drawRect(ins.x, ins.y, props.width, props.height);
    ins.endFill();
  }
});
