import React from 'react';
import { connect } from 'react-redux';

import { randomRange } from 'client/utils';
import { SystemsList } from 'ecs/System';
import { EntitiesList } from 'ecs/Entity';
import {
  CharacterFamily,
  SET_BODY,
  SET_HEAD,
  SET_NAME,
  SET_POSITION,
  SET_PRIVILEGE,
  SET_SHIELD,
  SET_WEAPON
} from 'ecs/entities/character/Character';
import Player, { PlayerControllableFamily } from 'ecs/entities/character/Player';
import TiledMap, { TiledMapFamily } from 'ecs/entities/map/TiledMap';
import Viewport, { ViewportFamily } from 'ecs/entities/viewport/Viewport';
import InputSystem from 'ecs/systems/input/InputSystem';
import DummySystem from 'ecs/systems/DummySystem';
import PhysicsSystem from 'ecs/systems/physics/PhysicsSystem';
import PlayerMovementSystem from 'ecs/systems/player/PlayerMovementSystem';
import MapRenderingSystem from 'ecs/systems/map/MapRenderingSystem';
import GridRenderingSystem from 'ecs/systems/debug/GridRenderingSystem';
import World from 'ecs/World';

import OBJECTS from 'client/assets/init/objects.json';
import map from 'client/assets/maps/old/Mapa34.map';
import inf from 'client/assets/maps/old/Mapa34.inf';
import MAP from 'client/assets/maps/1.json';
import ULLA from 'client/ulla.json';
import NIX from 'client/nix.json';
import {
  selectAnimations,
  selectBodies,
  selectGraphics,
  selectHeads,
  selectHelmets,
  selectResources,
  selectShields,
  selectSpriteSheets,
  selectWeapons
} from 'store/asset/asset.selectors';
import {
  selectCanvasHeight,
  selectCanvasWidth,
  selectWindowHeight,
  selectWindowWidth
} from 'store/render/render.selectors';
import { TILE_SIZE } from 'core/constants/game/Map';
import { roles } from 'core/constants/character';
import { getBinaryLayers } from 'core/loaders/maps/binary';
import { convertLayersToTmx } from 'core/loaders/maps/tmx/converter';

class Game extends React.Component {
  constructor(props) {
    super(props);
    const { resources } = this.props;
    // this.legacyMap = getBinaryLayers(this.props.graphics, this.props.animations, OBJECTS, map, inf);
    // this.map = convertLayersToTmx({ layers: this.legacyMap, resources });
    // console.log(this.legacyMap, this.map);

    this.player = React.createRef();
    this.state = {
      entities: [
        <Player
          key="player"
          ref={this.player}
          tags={['player']}
          components={PlayerControllableFamily}
        />
      ]
    };
  }

  componentDidMount() {
    const { bodies, heads, helmets, weapons, shields } = this.props;
    const { entity } = this.player.current;
    entity.emit(SET_NAME, 'Beta Tester');
    // entity.emit(SET_BODY, bodies[56]);
    entity.emit(SET_BODY, bodies[531]);
    entity.emit(SET_HEAD, heads[317]);
    entity.emit(SET_WEAPON, weapons[65]);
    entity.emit(SET_SHIELD, shields[5]);
    entity.emit(SET_POSITION, 50 * TILE_SIZE, 39 * TILE_SIZE);
    entity.emit(SET_PRIVILEGE, roles.admin);
    this.characterSpawner();
  }

  characterSpawner() {
    const { bodies, heads } = this.props;

    const interval = setInterval(() => {
      if (this.state.entities.length > 50) return clearInterval(interval);
      const newPlayer = React.createRef();

      this.state.entities.push((
        <Player
          ref={newPlayer}
          key={this.state.entities.length}
          components={CharacterFamily}
        />
      ));

      this.forceUpdate();
      return setTimeout(() => {
        const { entity: entity2 } = newPlayer.current.state;
        const body = Math.floor(randomRange(1, 4));
        const head = Math.floor(randomRange(1, 6));
        const x = Math.floor(randomRange(20, 50)) * TILE_SIZE;
        const y = Math.floor(randomRange(20, 50)) * TILE_SIZE;
        entity2.emit(SET_BODY, bodies[body]);
        entity2.emit(SET_HEAD, heads[head]);
        entity2.emit(SET_POSITION, x, y);
      });
    }, 100);
  }

  render() {
    const { entities } = this.state;
    const {
      bodies,
      heads,
      helmets,
      shields,
      weapons,
      graphics,
      resources,
      spriteSheets,
    } = this.props;
    const {
      canvasWidth,
      canvasHeight,
      width,
      height,
      scale,
    } = this.props;
    return (
      <React.Fragment>
        <World>
          <SystemsList>
            <DummySystem
              bodies={bodies}
              heads={heads}
              helmets={helmets}
              shields={shields}
              weapons={weapons}
            />
            <InputSystem />
            <PhysicsSystem />
            <PlayerMovementSystem />
            <MapRenderingSystem>
              <EntitiesList>
                <Viewport
                  components={ViewportFamily}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  boundsLock={false}
                  width={width}
                  height={height}
                  scale={scale}
                >
                  <TiledMap
                    components={TiledMapFamily}
                    spriteSheets={spriteSheets}
                    resources={resources}
                    graphics={graphics}
                    tmx={NIX}
                  />
                  {entities.map(e => e)}

                  {/* debug
                  <GridRenderingSystem /> */}
                </Viewport>
              </EntitiesList>
            </MapRenderingSystem>
          </SystemsList>
        </World>
      </React.Fragment>
    );
  }
}

export const mapStateToProps = state => ({
  graphics: selectGraphics(state),
  animations: selectAnimations(state),
  spriteSheets: selectSpriteSheets(state),
  resources: selectResources(state),
  bodies: selectBodies(state),
  heads: selectHeads(state),
  helmets: selectHelmets(state),
  weapons: selectWeapons(state),
  shields: selectShields(state),

  width: selectWindowWidth(state),
  height: selectWindowHeight(state),
  canvasWidth: selectCanvasWidth(state),
  canvasHeight: selectCanvasHeight(state),
});

const GameContainer = connect(mapStateToProps)(Game);
export default GameContainer;
