import { Container, Sprite, Text } from '@inlet/react-pixi';
import { GlowFilter } from '@pixi/filter-glow';
import { pointCircle, pointPolygon } from 'intersects';
import React from 'react';
import { Point } from 'pixi.js';
import Ease from 'pixi-ease';
import 'pixi-layers';

import Circle from 'client/components/PIXI/UI/shapes/Circle';
import Animation from 'client/components/PIXI/Animation/Animation';
import Rectangle from 'client/components/PIXI/UI/shapes/Rectangle';
import { round, polygon } from 'client/utils';

import Gear, { BODY, HEAD, HELMET, SHIELD, WEAPON } from 'ecs/components/character/Gear';
import Debug from 'ecs/components/common/Debug';
import Flags from 'ecs/components/character/Flags';
import Heading from 'ecs/components/character/Heading';
import Health from 'ecs/components/character/Health';
import Identity from 'ecs/components/character/Identity';
import OnPhysicsUpdate from 'ecs/components/physics/OnPhysicsUpdate';
import Privilege, { PRIVILEGE } from 'ecs/components/character/Privilege';
import Controllable from 'ecs/components/character/Controllable';
import Layers from 'ecs/components/map/Layers';
import Physic, { RUNNING_SPEED, WALKING_SPEED } from 'ecs/components/physics/Physic';
import PhysicsScene from 'ecs/components/physics/PhysicsScene';
import Camera from 'ecs/components/viewport/Camera';
import { SET_TRIGGER } from 'ecs/entities/map/TiledMap';
import { ADD_BODY, ON_PHYSICS_UPDATE, REMOVE_BODY } from 'ecs/entities/physics/Scene';
import { ON_CAMERA_UPDATE } from 'ecs/entities/viewport/Viewport';
import Entity from 'ecs/Entity';

import { CHARACTER_ROLE_STYLES, roles, styles } from 'core/constants/character';
import { EAST, HEADINGS, NORTH, SOUTH, WEST } from 'core/constants/game/Game';
import { CHARACTER_TYPE, ENTITIES_LAYER, TILE_SIZE } from 'core/constants/game/Map';
import { getTexture } from 'core/loaders/graphics';
import { createCircle } from 'core/util/physics';

export const HIT = 'hit';
export const MOVE_UP = 'move up';
export const MOVE_DOWN = 'move down';
export const MOVE_LEFT = 'move left';
export const MOVE_RIGHT = 'move right';
export const STOP_MOVING = 'stop moving';
export const SET_BODY = 'set body';
export const SET_HEAD = 'set head';
export const SET_HELMET = 'set helmet';
export const SET_WEAPON = 'set weapon';
export const SET_SHIELD = 'set shield';
export const SET_POSITION = 'set position';
export const SET_SPEED = 'set speed';
export const SET_PRIVILEGE = 'set privilege';
export const SET_NAME = 'set name';
export const SET_CLAN = 'set clan';

export const PHYSICS_BODY = { mass: 100, restitution: 0.05, damping: 1 / 1000 };
export const MOVING_THRESHOLD = 0.001;
export const COLLISION_THRESHOLD = 0.01;

export const DEBUG_OFFSET = -2 * TILE_SIZE;
export const NAME_OFFSET = TILE_SIZE / 4;
export const CLAN_OFFSET = NAME_OFFSET + 16;

export const CharacterFamily = [OnPhysicsUpdate, Flags, Gear, Heading, Identity, Physic, Privilege];
export const CharacterWithHealth = [...CharacterFamily, Health];
class Character extends Entity {
  constructor(props) {
    super(props);
    const { debug } = props;
    if (debug) this.entity.addComponent(Debug);

    this.addListener(ON_PHYSICS_UPDATE, this.onPhysicsUpdate);
    this.addListener(STOP_MOVING, this.stopMoving);
    this.addListener(MOVE_UP, this.handleMovement(NORTH));
    this.addListener(MOVE_DOWN, this.handleMovement(SOUTH));
    this.addListener(MOVE_LEFT, this.handleMovement(WEST));
    this.addListener(MOVE_RIGHT, this.handleMovement(EAST));
    this.addListener(SET_BODY, this.setGear(BODY));
    this.addListener(SET_HEAD, this.setGear(HEAD));
    this.addListener(SET_HELMET, this.setGear(HELMET));
    this.addListener(SET_WEAPON, this.setGear(WEAPON));
    this.addListener(SET_SHIELD, this.setGear(SHIELD));
    this.addListener(SET_SPEED, this.setSpeed);
    this.addListener(SET_POSITION, this.setPosition);
    this.addListener(SET_PRIVILEGE, this.setPrivilege);
    this.addListener(SET_NAME, this.setName);
    this.addListener(SET_CLAN, this.setClan);
    this.addListener(HIT, this.hitHandler);
    this.entity.isMoving = this.isMoving.bind(this);
    this.entity.isRunning = this.isRunning.bind(this);
    this.entity.isWalking = this.isWalking.bind(this);

    this.click = this.click.bind(this);
    this.rightClick = this.rightClick.bind(this);
    this.pointerOver = this.pointerOver.bind(this);
    this.pointerOut = this.pointerOut.bind(this);
    this.bodyContainer = React.createRef();
    this.container = React.createRef();
    this.debug = React.createRef();
    this.body = React.createRef();
    this.weapon = React.createRef();
    this.shield = React.createRef();
    this.head = React.createRef();
    this.helmet = React.createRef();
    this.name = React.createRef();
    this.clan = React.createRef();

    this.ease = new Ease.list();
    this.bodyOffset = new Point();
    this.glow = new GlowFilter(2, 0, 0, 0xff482a);
    this.filters = [this.glow];
  }

  componentDidMount() {
    const { entity } = this;
    const { world } = this.props;
    this.props.app.ticker.add(this.update, this);

    if (entity.hasComponent(Physic)) {
      const width = entity.physic.radius || entity.physic.width;
      const height = entity.physic.radius || entity.physic.height;
      const body = createCircle({ width, height, ...PHYSICS_BODY });
      const scene = world.queryComponents([PhysicsScene])[0];
      scene.emit(ADD_BODY, body, true);
      entity.physic.body = body;
    }
  }

  componentWillUnmount() {
    const { entity } = this;
    const { world } = this.props;
    this.props.app.ticker.remove(this.update);

    if (entity.hasComponent(Physic)) {
      const { body } = entity.physic;
      const scene = world.queryComponents([PhysicsScene])[0];
      scene.emit(REMOVE_BODY, body);
    }
  }

  calculateBodyOffset(entity) {
    const { heading } = entity;
    const direction = HEADINGS[heading.direction];

    if (entity.gear.body[direction]) {
      const { radius } = entity.physic;
      const body = entity.gear.body[direction].frames[0];
      const x = (TILE_SIZE - body.width) / 2;
      const y = (TILE_SIZE - body.height) - radius;
      return new Point(x, y);
    }

    return new Point();
  }

  handleMovement(direction) {
    return () => {
      const { entity } = this;

      if (entity.hasComponent(Physic)) {
        switch (direction) {
        case NORTH:
          entity.physic.body.velocity.x = 0;
          entity.physic.body.velocity.y = -entity.physic.speed;
          break;
        case SOUTH:
          entity.physic.body.velocity.x = 0;
          entity.physic.body.velocity.y = entity.physic.speed;
          break;
        case WEST:
          entity.physic.body.velocity.x = -entity.physic.speed;
          entity.physic.body.velocity.y = 0;
          break;
        case EAST:
          entity.physic.body.velocity.x = entity.physic.speed;
          entity.physic.body.velocity.y = 0;
          break;
        default: break;
        }
      }

      if (entity.hasComponent(Heading)) {
        entity.heading.direction = direction;
        setTimeout(() => this.forceUpdate());
        if (entity.hasComponent(Gear) && entity.gear.body) {
          this.bodyOffset = this.calculateBodyOffset(entity);
        }
      }
    };
  }

  setGear(gear) {
    return (value) => {
      const { entity } = this;

      if (entity.hasAllComponents([Gear, Physic])) {
        entity.gear[gear] = value;
        if (gear === BODY) this.bodyOffset = this.calculateBodyOffset(entity);
        this.forceUpdate();
      }
    };
  }

  stopMoving() {
    const { entity } = this;

    if (entity.hasComponent(Physic)) {
      entity.physic.body.velocity.set(0, 0);
    }

    if (entity.hasComponent(Gear)) {
      this.stopAnimations();
    }
  }

  stopAnimations() {
    const { entity } = this;
    if (entity.hasComponent(Gear)) {
      if (this.body.current) this.body.current.gotoAndStop(0);
      if (this.weapon.current) this.weapon.current.gotoAndStop(0);
      if (this.shield.current) this.shield.current.gotoAndStop(0);
    }
  }

  isRunning() {
    const { entity } = this;

    if (entity.hasComponent(Physic)) {
      return entity.physic.speed >= RUNNING_SPEED;
    }

    return false;
  }

  isWalking() {
    const { entity } = this;

    if (entity.hasComponent(Physic)) {
      return entity.physic.speed === WALKING_SPEED;
    }

    return false;
  }

  isMoving() {
    const { entity } = this;

    if (entity.hasComponent(Physic)) {
      const { body } = entity.physic;
      const { x, y } = body && body.velocity;
      return Math.abs(x) > MOVING_THRESHOLD || Math.abs(y) > MOVING_THRESHOLD;
    }

    return false;
  }

  setSpeed(speed) {
    const { entity } = this;

    if (entity.hasComponent(Physic)) {
      entity.physic.speed = speed;
    }

    if (entity.hasComponent(Privilege)) {
      const { level } = entity.privilege;
      if (level >= PRIVILEGE[roles.admin]) {
        this.applyAdminNoClip(speed);
      }
    }
  }

  setPosition(x, y) {
    const { entity } = this;

    if (entity.hasComponent(Physic)) {
      entity.physic.body.setPosition(x, y);
      this.forceUpdate();

      const { world } = this.props;
      const viewport = world.queryComponents([Camera])[0];
      viewport.emit(ON_CAMERA_UPDATE);
    }
  }

  setPrivilege(role) {
    const { entity } = this;

    if (entity.hasComponent(Privilege)) {
      entity.privilege.role = role;
      entity.privilege.level = PRIVILEGE[role];
      this.forceUpdate();
    }
  }

  setName(name) {
    const { entity } = this;

    if (entity.hasComponent(Identity)) {
      entity.identity.name = name;
      setTimeout(() => this.updateTextWidth(this.name.current, NAME_OFFSET));
    }
  }

  setClan(clan) {
    const { entity } = this;

    if (entity.hasComponent(Identity)) {
      entity.identity.clan = clan;
      setTimeout(() => this.updateTextWidth(this.clan.current, CLAN_OFFSET));
    }
  }

  updateTextWidth(text, offset = 0) {
    text.x = (TILE_SIZE / 2) - (text.width / 2);
    text.y = (TILE_SIZE / 2) + offset;
  }

  hitHandler(damage) {
    const { entity } = this;

    if (entity.hasComponent(Health)) {
      entity.health.hp -= damage;
      entity.health.hp = entity.health.hp.toFixed(2);
    }

    this.setState({ entity });
  }

  applyAdminNoClip(speed) {
    const { entity } = this;
    if (entity.hasComponent(Physic)) {
      const { body } = entity.physic;

      if (speed === RUNNING_SPEED) {
        entity.physic.speed *= 2;
        body.mass = 0;
        body.inverseMass = 0;
      }

      if (speed === WALKING_SPEED) {
        body.mass = PHYSICS_BODY.mass;
        body.inverseMass = 1 / PHYSICS_BODY.mass;
      }
    }
  }

  applyTrigger(entity) {
    if (entity.hasAllComponents([Controllable, Flags, Physic]) && this.triggers) {
      const { flags } = entity;
      const { radius } = entity.physic;
      const { body: { position } } = entity.physic.body;
      let triggered = false;

      this.triggers.forEach((t) => {
        if (pointPolygon(
          position.x + TILE_SIZE / 2,
          position.y + TILE_SIZE / 2,
          polygon(t.polygon),
          COLLISION_THRESHOLD,
        )) {
          if (!this.map.hasTrigger(t)) this.map.emit(SET_TRIGGER, t);
          flags.trigger = this.map.getTriggerFromLayer(t);
          triggered = true;
        }
      });

      if (!triggered && this.map.getTrigger()) {
        this.map.emit(SET_TRIGGER);
        flags.trigger = null;
      }
    }
  }

  applyAnimations(entity, delta) {
    if (this.isMoving()) {
      if (this.body.current) this.body.current.update(delta);
      if (this.weapon.current) this.weapon.current.update(delta);
      if (this.shield.current) this.shield.current.update(delta);
    } else {
      this.stopAnimations();
    }
  }

  applyPhysics(entity, alpha) {
    if (entity.hasComponent(Physic)) {
      const { position: current } = this.container.current;
      const { position: target } = entity.physic.body;
      // this.ease.to(current, { x: target.x, y: target.y }, step);

      // alpha *= 15.0;
      // const stateX = target.x * alpha + current.x * (1.0 - alpha);
      // const stateY = target.y * alpha + current.y * (1.0 - alpha);
      // current.x = stateX;
      // current.y = stateY;
      current.x = target.x;
      current.y = target.y;
    }
  }

  onPhysicsUpdate(delta, alpha) {
    const { entity } = this;
    this.applyPhysics(entity, alpha);
  }

  update(delta) {
    const { entity } = this;
    const { world } = this.props;

    if (!this.map) {
      ([this.map] = world.queryComponents([Layers]));
      const { layers, mapComponent } = this.map;
      this.group = layers.groups[ENTITIES_LAYER];
      this.container.current.parentGroup = this.group;
      this.triggers = mapComponent.triggers;
    }

    this.applyTrigger(entity);
    this.applyAnimations(entity, delta);
  }

  renderBody(direction) {
    const { entity } = this;
    const { gear: { body } } = entity;
    const { gear: { shield, weapon } } = entity;
    const renderShield = shield && shield[direction] && shield[direction] !== 0;
    const renderWeapon = weapon && weapon[direction] && weapon[direction] !== 0;
    const renderBody = body && body[direction] && body[direction] !== 0;

    let headOffsetY = body ? body.headOffsetY : 0;
    if (renderBody && body[direction].height <= 40) headOffsetY -= 4;

    const gear = [
      renderShield === true && (
        <Animation
          key="shield"
          ref={this.shield}
          animation={shield[direction]}
          y={headOffsetY}
        />
      ),
      renderWeapon === true && (
        <Animation
          key="weapon"
          ref={this.weapon}
          animation={weapon[direction]}
          y={headOffsetY}
        />
      )];
    const torso = [renderBody === true && (
      <Animation
        key="body"
        ref={this.body}
        animation={body[direction]}
      />
    )];

    const invert = direction === HEADINGS[NORTH] || direction === HEADINGS[WEST];
    const hands = invert ? gear.reverse() : gear;
    return renderBody && invert ? [hands[0], ...torso, hands[1]] : [...torso, ...hands];
  }

  renderHead(direction) {
    const { entity } = this;
    const { gear: { body, head, helmet } } = entity;
    const headOffsetX = body ? body.headOffsetX + 4 : 0;
    const headOffsetY = body ? body.headOffsetY - 4 : 0;
    const renderHead = head && head[direction] && head[direction] !== 0;
    const renderHelmet = helmet && head[direction] && helmet[direction] !== 0;
    return (
      <Container x={headOffsetX} y={headOffsetY}>
        { renderHead === true && <Sprite ref={this.head} texture={getTexture(head[direction])} /> }
        { renderHelmet === true && <Sprite ref={this.helmet} texture={getTexture(helmet[direction])} /> }
      </Container>
    );
  }

  renderName() {
    const { entity } = this;
    const { identity } = entity;
    let style = styles.name;

    if (entity.hasComponent(Privilege) && entity.privilege) {
      const { level, role } = entity.privilege;
      style = CHARACTER_ROLE_STYLES[role];
      if (level >= PRIVILEGE[roles.admin] && !identity.clan) {
        entity.emit(SET_CLAN, '<Game Master>');
      }
    }

    return identity && (
      <React.Fragment>
        <Text ref={this.name} text={identity.name} style={style} />
        <Text ref={this.clan} text={identity.clan} style={style} />
      </React.Fragment>
    );
  }

  renderDebug() {
    const { entity } = this;
    const style = styles.debug;

    let debug = null;
    let collision = null;
    if (entity.hasAllComponents([Debug, Physic]) && entity.physic.body) {
      const { body, radius } = entity.physic;
      const { velocity, position } = body;
      const tilePositionX = Math.floor((position.x / TILE_SIZE) + 0.5);
      const tilePositionY = Math.floor((position.y / TILE_SIZE) + 0.5);
      const text = `
        Speed: (${round(velocity.x)}, ${round(velocity.y)})
        Position: (${round(position.x)}, ${round(position.y)})
        Tile Position: (${tilePositionX}, ${tilePositionY})
      `;

      debug = (
        <Text
          ref={this.debug}
          y={DEBUG_OFFSET}
          text={text}
          style={style}
          scale={1.1}
          anchor={0.5}
          alpha={0.6}
        />
      );
      collision = (
        <Circle
          x={TILE_SIZE / 2}
          y={TILE_SIZE / 2}
          radius={radius}
          fill={0xff00000}
          alpha={0.3}
        />
      );
    }

    return (
      <React.Fragment>
        { this.showDebug && debug }
        { this.showDebug && collision }
      </React.Fragment>
    );
  }

  click(e) {
    console.log('click');
    this.emit(HIT, 10);
  }

  rightClick(e) {
    console.log(e);
  }

  pointerOver(e) {
    const { entity } = this;
    this.ease.to(this.glow.uniforms, { outerStrength: 1.0, innerStrength: 0.5 }, 200);

    if (entity.hasComponent(Debug)) {
      this.showDebug = true;
      this.forceUpdate();
    }
  }

  pointerOut(e) {
    const { entity } = this;
    this.ease.to(this.glow.uniforms, { outerStrength: 0, innerStrength: 0 }, 200);

    if (entity.hasComponent(Debug)) {
      this.showDebug = false;
      this.forceUpdate();
    }
  }

  render() {
    const { heading, health } = this.entity;
    const direction = HEADINGS[heading.direction];
    const body = this.renderBody(direction);
    const head = this.renderHead(direction);
    const name = this.renderName();

    return (
      <React.Fragment>
        <Container
          type={CHARACTER_TYPE}
          ref={this.container}
          anchor={0.5}
        >
          { name }
          { health && <Text text={health.hp} /> }
          { this.renderDebug() }
          <Container
            interactive={true}
            click={this.click}
            pointerdown={this.click}
            pointerover={this.pointerOver}
            pointerout={this.pointerOut}
            rightclick={this.rightClick}
            ref={this.bodyContainer}
            filters={this.filters}
            x={this.bodyOffset.x}
            y={this.bodyOffset.y}
          >
            { head }
            { body }
          </Container>
        </Container>
      </React.Fragment>
    );
  }
}

export default Character;
