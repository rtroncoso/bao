import { PixiComponent } from '@inlet/react-pixi';
import React from 'react';
import { Graphics } from 'pixi.js';

const CIRCLE = 'Circle';
export const behavior = {
  create: () => new Graphics(),

  applyProps: (g, oldProps, props) => {
    const { lineWidth = 1, lineColor = '#fff', fill, x, y, radius } = props;
    if (props.parentGroup) g.parentGroup = props.parentGroup;
    if (props.alpha) g.alpha = props.alpha;
    g.clear();
    g.beginFill(fill);
    g.lineStyle(lineWidth, lineColor);
    g.drawCircle(x, y, radius);
    g.endFill();
  }
};

export default PixiComponent(CIRCLE, behavior);
