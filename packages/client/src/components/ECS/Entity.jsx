import invariant from 'fbjs/lib/invariant';
import ecs from 'nano-ecs';
import React from 'react';

import { diff } from 'client/utils';

export const EntitiesList = props => props.children;

export const withFamily = (props, family) => ({ ...props, components: [...props.components, ...family] });

export class SyncedEntity extends React.Component {
  static checkDiffAndCall(prev = [], next = [], add = () => {}, remove = () => {}) {
    diff(prev, next).forEach((t) => {
      if (prev.indexOf(t) > -1 && !(next.indexOf(t) > -1)) {
        return remove(t);
      }

      return add(t);
    });
  }

  static getDerivedStateFromProps(props = {}, state = {}) {
    if (props.tags !== state.tags) {
      SyncedEntity.checkDiffAndCall(
        state.tags,
        props.tags,
        state.entity.addTag,
        state.entity.removeTag
      );

      return { tags: props.tags };
    }

    if (props.components !== state.components) {
      SyncedEntity.checkDiffAndCall(
        state.components,
        props.components,
        state.entity.addComponent,
        state.entity.removeComponent
      );

      return { components: props.components };
    }

    return null;
  }

  constructor(props) {
    super(props);
  }
}

class Entity extends SyncedEntity {
  constructor(props) {
    super(props);

    const { world, tags, components } = this.props;

    invariant(
      typeof world !== typeof ecs,
      'You must provide a `World` instance into this component. '
      + ' Please use `withWorld` or `WorldProvider` wrappers.'
    );

    const entity = world.createEntity();
    entity.component = this;

    if (components && components.length) {
      components.forEach(c => entity.addComponent(c));
    }

    if (tags && tags.length) {
      tags.forEach(t => entity.addTag(t));
    }

    this.state = { entity };
    this.entity = entity;
  }

  componentDidMount() {
    this.entity.emit = this.emit.bind(this);
  }

  componentWillUnmount() {
    this.entity.remove();
  }

  emit(name, ...args) {
    this.entity.emit(name, ...args);
  }

  addListener(name, callback) {
    callback = callback.bind(this);
    return this.entity.on(name, callback);
  }

  render() {
    return this.props.children || null;
  }
}

export default Entity;
