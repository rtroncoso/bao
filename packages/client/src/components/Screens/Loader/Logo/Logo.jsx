import { Sprite } from '@inlet/react-pixi';
import React from 'react';

// import LOGO from './logo@2x.png';

/**
 * Pixi Seed Logo
 *
 * @exports Logo
 * @extends Sprite
 */
const Logo = ({ x, y }) => ({
  render() {
    return (
      {/* <Sprite
        image={LOGO}
        anchor={({ x: 0.5, y: 0.5 })}
        scale={0.8}
        x={x}
        y={y}
      /> */}
    );
  }
});

export default Logo;
