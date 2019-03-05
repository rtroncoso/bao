import { Sprite } from '@inlet/react-pixi';
import React from 'react';

import { randomRange } from 'client/utils';
import { Texture, Point } from 'pixi.js';
import { easing, tween } from 'popmotion';

import LINE from './line.png';

/**
 * Red line gfx
 *
 * Popmotion Tween Example
 *
 * @exports RedLine
 * @extends Sprite
 */
export default class RedLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      alpha: randomRange(0.2, 0.4),
      position: new Point(props.x, randomRange(props.y - 100, props.y + 200)),
      scale: new Point(randomRange(0.8, 1.2), randomRange(0.7, 1.4))
    };

    this.line = React.createRef();
  }

  componentDidMount() {
    const offset = randomRange(-500, 500);

    tween({
      from: this.state.position.y,
      to: this.props.y + offset,
      duration: randomRange(2000, 4000),
      ease: easing.easeInOut,
      flip: Infinity
    }).start(v => this.line.current.position.y = v);
  }

  render() {
    const { x, y } = this.state.position;
    return (
      <Sprite ref={this.line} image={LINE} x={x} y={y} {...this.state} />
    );
  }
}
