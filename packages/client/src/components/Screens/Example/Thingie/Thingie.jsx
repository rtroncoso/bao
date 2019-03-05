import { Container, Sprite, Text, withPixiApp } from '@inlet/react-pixi';
import { Point } from 'pixi.js';
import React from 'react';

import { distance } from 'client/utils';
import Animation from 'client/components/PIXI/Animation/Animation';
import { HEADINGS, WEST } from 'core/constants/game/Game';
import { TILE_SIZE } from 'core/constants/game/Map';
import { getTexture } from 'core/loaders/graphics';
import Rectangle from '../../../PIXI/UI/shapes/Rectangle';

/**
 * A small shape
 *
 * @exports Thingie
 * @extends Sprite
 */
class Thingie extends React.Component {
  constructor(props) {
    super(props);

    // of course local state digest is going to be under-performing
    this.state = {
      position: new Point(props.x, props.y),
      targetOffset: new Point(0, 0),
      offset: new Point(0, 0),
      rotationTimer: 0.0,
      direction: 0,
    };

    this.container = React.createRef();
    this.body = React.createRef();
    this.weapon = React.createRef();
    this.shield = React.createRef();
  }

  componentDidMount() {
    this.props.app.ticker.add(this.update, this);
  }

  componentWillUnmount() {
    this.props.app.ticker.remove(this.update);
  }

  update(delta) {
    this.state.rotationTimer += delta;

    if (this.state.rotationTimer >= 60) {
      this.setState(state => ({
        direction: state.direction >= 3 ? 0 : state.direction + 1
      }));

      this.state.rotationTimer = 0.0;
    }

    const { x, y } = this.props.mouse;
    const x1 = this.props.x;
    const y1 = this.props.y;
    const xDist = x - x1;
    const yDist = y - y1;
    const dist = distance({ x, y }, { x: x1, y: y1 });

    if (dist < 200) {
      const angle = Math.atan2(yDist, xDist);
      const xaDist = Math.cos(angle) * dist;
      const yaDist = Math.sin(angle) * dist;
      this.state.targetOffset.x = xaDist;
      this.state.targetOffset.y = yaDist;
    } else {
      this.state.targetOffset.x = 0;
      this.state.targetOffset.y = 0;
    }

    this.state.offset.x += (this.state.targetOffset.x - this.state.offset.x) * 0.01;
    this.state.offset.y += (this.state.targetOffset.y - this.state.offset.y) * 0.01;

    this.state.position.x = this.props.x + this.state.offset.x;
    this.state.position.y = this.props.y + this.state.offset.y;

    const direction = HEADINGS[this.state.direction];
    const bodyOffsetX = (this.props.body[direction].frames[0].width - TILE_SIZE) / 2;
    const bodyOffsetY = this.props.body[direction].frames[0].height - TILE_SIZE;
    this.container.current.position.x = this.state.position.x - bodyOffsetX;
    this.container.current.position.y = this.state.position.y - bodyOffsetY;

    this.body.current.update(delta);
    this.weapon.current.update(delta);
    this.shield.current.update(delta);
  }

  renderGear({ shield, weapon, direction }) {
    const shieldAnimation = shield && shield[direction];
    const weaponAnimation = weapon && weapon[direction];
    return [
      shieldAnimation && <Animation ref={this.shield} animation={shieldAnimation} />,
      weaponAnimation && <Animation ref={this.weapon} animation={weaponAnimation} />
    ];
  }

  renderHead({ helmet, head, direction }) {
    const headTexture = head && head[direction] && getTexture(head[direction]);
    const helmetTexture = helmet && helmet[direction] && getTexture(helmet[direction]);
    return [
      headTexture && <Sprite texture={headTexture} />,
      helmetTexture && <Sprite texture={helmetTexture} />
    ];
  }

  render() {
    const { body, weapon, shield, helmet, head } = this.props;
    const { x, y } = this.state.position;
    const direction = HEADINGS[this.state.direction];
    const gear = this.renderGear({ shield, weapon, direction });
    const upper = this.renderHead({ helmet, head, direction });

    return (
      <React.Fragment>
        <Container ref={this.container} alpha={0.8}>
          <Animation ref={this.body} animation={body[direction]} />
          <Container x={body.headOffsetX + 4} y={body.headOffsetY - 4}>{upper}</Container>
          { direction === HEADINGS[WEST] ? gear.reverse() : gear }
        </Container>
      </React.Fragment>
    );
  }
}

export default withPixiApp(Thingie);
