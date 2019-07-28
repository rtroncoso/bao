import { useApp, useTick } from '@inlet/react-pixi';

import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Layer from 'client/components/PIXI/Layers/Layer';
import Stage from 'client/components/PIXI/Layers/Stage';
import Layers from 'ecs/components/map/Layers';
import System from 'ecs/System';
import { useWorld } from 'ecs/World';

const MapRenderingSystem = ({ children }) => {
  const [layers, setLayers] = useState();
  const world = useWorld();
  const app = useApp();

  useEffect(() => {
    const maps = world.queryComponents([Layers]);
    setLayers(maps[0].layers.groups);
  }, [world]);

  // useTick(delta => {
  //   const map = world.queryComponents([Layers]);
  //   if (map && map.length && layers !== map[0].layers.groups) {
  //     setLayers(map.layers.groups);
  //   }
  // });

  return (
    <Stage enableSort>
      { layers && Object.values(layers).map((l, i) => (<Layer key={i} group={l} />)) }
      { children }
    </Stage>
  );
};

MapRenderingSystem.defaultProps = {
  children: []
};

MapRenderingSystem.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.array
  ])
};

export default MapRenderingSystem;
