import { PixiComponent } from '@inlet/react-pixi';
import React from 'react';
import { Graphics } from 'pixi.js';

const RECTANGLE = 'Rectangle';
export const behavior = {
  create: () => new Graphics(),

  applyProps: (g, oldProps, props) => {
    const { lineWidth = 1, lineColor = '#fff', fill, x, y, width, height } = props;
    if (props.parentGroup) g.parentGroup = props.parentGroup;
    if (props.alpha) g.alpha = props.alpha;
    g.clear();
    g.beginFill(fill);
    g.lineStyle(lineWidth, lineColor);
    g.drawRect(x, y, width, height);
    g.endFill();
  }
};

export default PixiComponent(RECTANGLE, behavior);
