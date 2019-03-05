import invariant from 'fbjs/lib/invariant';
import ecs from 'nano-ecs';
import React from 'react';
import { Application } from 'pixi.js';

export const SystemsList = props => props.children;

class PixiSystem extends React.Component {
  constructor(props) {
    super(props);
    const { app, world } = props;

    invariant(
      typeof world !== typeof ecs,
      'You must provide a `World` instance into this component.'
      + ' Please use `withWorld` or `WorldProvider` wrappers.'
    );

    invariant(
      typeof app !== typeof Application,
      'You must provide a `Application` instance into this component.'
      + ' Please use `withPixiApp` or `AppProvider` wrappers.'
    );
  }

  componentWillMount() {
    this.props.app.ticker.add(this.update, this);
  }

  componentWillUnmount() {
    this.props.app.ticker.remove(this.update);
  }

  update(delta) {}

  render() {
    return this.props.children || null;
  }
}

export default PixiSystem;
