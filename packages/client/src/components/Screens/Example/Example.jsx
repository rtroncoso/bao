import Animation from 'client/components/PIXI/Animation/Animation';
import _ from 'lodash';
import { Container, Sprite, withPixiApp } from '@inlet/react-pixi';
import { Point } from 'pixi.js';
import React from 'react';
import { connect } from 'react-redux';

import { isNear } from 'client/utils';
import ThingiesList from 'client/components/Screens/Example/Thingie/ThingiesList';
import RedLine from 'client/components/Screens/Example/RedLine/RedLine';
import { canvasWidth, canvasHeight } from 'core/constants/game/App';
import { TILE_SIZE } from 'core/constants/game/Map';
import { findAnimation, findGraphic } from 'core/loaders/util';

import {
  selectAnimations,
  selectBodies,
  selectGraphics,
  selectHeads,
  selectHelmets,
  selectShields,
  selectWeapons
} from 'store/asset/asset.selectors';

import MAP from 'client/assets/maps/1.json';

export const VIEW_DISTANCE = 32;
const viewportCenter = new Point(40, 40);

/**
 * Main Display Object
 *
 * @exports Example
 * @extends Screen
 */
class Example extends React.Component {
  constructor(props) {
    super(props);

    // render subjects
    this.state = {
      animations: [],
      graphics: [],
      thingies: [],
      lines: [],
      tiles: [],
    };
  }

  componentDidMount() {
    const { animations, graphics } = this.props;

    // this.addMap(animations, graphics);
    this.addThingies();
    this.addLines();

    // debug
    // this.addGraphics(graphics);
    // this.addAnimations(animations);
  }

  pickRandom(from, length) {
    length = length || Object.keys(from).length;
    return from[Math.floor(Math.random() * length)];
  }

  addThingies() {
    const thingies = [];

    for (let index = 0; index < 100; index++) {
      const body = this.pickRandom(this.props.bodies, 30);
      const weapon = this.pickRandom(this.props.weapons);
      const shield = this.pickRandom(this.props.shields);
      const head = this.pickRandom(this.props.heads);
      const helmet = this.pickRandom(this.props.heads);

      if (
        (body && body.up) &&
        (shield && shield.up) &&
        (weapon && weapon.up)
      ) {
        const t = {
          index,
          body,
          weapon,
          shield,
          head,
          helmet,
          position: {
            x: canvasWidth * Math.random(),
            y: (canvasHeight + 300) * Math.random() - 300,
          }
        };
        const near = thingies.some(t2 => isNear(t.position, t2.position));
        if (!near) {
          thingies.push(t);
        }
      }
    }

    this.setState({ thingies });
  }

  addLines() {
    const lines = [];
    const count = 100;

    for (let index = 0; index < count; index++) {
      const x = canvasWidth / count * index;
      const y = Math.sin(index * 2) * canvasHeight - 500;
      lines.push({ index, x, y });
    }

    this.setState({ lines });
  }

  addMap(animations, graphics) {
    const tiles = [];
    const mapNum = 1;
    const mapWidth = 100;
    const mapHeight = 100;

    for (let l = 1; l <= 4; l++) {
      for (let y = 1; y <= mapHeight; y++) {
        for (let x = 1; x <= mapWidth; x++) {
          if (isNear(viewportCenter, new Point(x, y), VIEW_DISTANCE)) {
            const grh = MAP[mapNum][y][x].g[l];
            if (grh) {
              const graphic = findGraphic(graphics, grh);
              const animation = graphic.frames.length > 0 ? findAnimation(animations, grh) : null;
              const index = `${x}:${y}`;
              tiles.push({
                index,
                layer: l,
                graphic: animation || graphic,
                position: {
                  x: (x - 20) * TILE_SIZE,
                  y: (y - 30) * TILE_SIZE,
                }
              });
            }
          }
        }
      }
    }

    this.setState({ tiles });
  }

  addGraphics(graphics = {}) {
    const list = [];
    let x = 0;
    let y = 0;
    let largestHeight = 0;

    for (const key of Object.keys(graphics)) {
      const graphic = _.get(graphics, key);
      list.push({ graphic, x, y });
      x += graphic.width;

      if (graphic.height > largestHeight) {
        largestHeight = graphic.height;
      }

      if (x >= (30 * TILE_SIZE)) {
        y += largestHeight;
        largestHeight = 0;
        x = 0;
      }
    }

    this.setState({ graphics: list });
  }

  addAnimations(animations = []) {
    const list = [];
    const initialX = 500;
    let x = initialX;
    let y = 0;
    let largestHeight = 0;

    for (const animation of animations) {
      if (animation) {
        list.push({ animation, x, y });
        x += animation.texture.width;

        if (animation.height > largestHeight) {
          largestHeight = animation.texture.height;
        }

        if (x >= (30 * TILE_SIZE)) {
          y += largestHeight;
          largestHeight = 0;
          x = initialX;
        }
      }
    }

    this.setState({ animations: list });
  }

  render() {
    const { thingies, lines, tiles } = this.state;
    return (
      <Container interactive={true} mousemove={this.mouseMoveHandler}>
        <React.Fragment>
          {tiles.map(t => (
            <React.Fragment>
              { t.graphic && t.graphic.frames.length > 0 ? (
                <Animation
                  animation={t.graphic}
                  key={t.index}
                  x={t.position.x}
                  y={t.position.y}
                />
              ) : (
                <Sprite
                  texture={t.graphic.texture}
                  key={t.index}
                  x={t.position.x}
                  y={t.position.y}
                />
              ) }
            </React.Fragment>
          ))}
        </React.Fragment>
        <React.Fragment>
          <ThingiesList thingies={thingies} />
        </React.Fragment>
        <React.Fragment>
          {lines.map(l => (
            <RedLine
              key={l.index}
              x={l.x}
              y={l.y}
            />
          ))}
        </React.Fragment>
      </Container>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  graphics: selectGraphics(state),
  animations: selectAnimations(state),
  bodies: selectBodies(state),
  weapons: selectWeapons(state),
  shields: selectShields(state),
  helmets: selectHelmets(state),
  heads: selectHeads(state),
  ...ownProps
});

const ExampleContainer = connect(mapStateToProps)(Example);
export default withPixiApp(ExampleContainer);
