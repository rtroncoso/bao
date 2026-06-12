import React, {
  createContext,
  useCallback,
  useContext,
  useEffect
} from 'react';
import range from 'lodash/fp/range';

import { Group } from '@pixi/layers';
import { Layer, Stage, LayersStageUpdate } from '@bao/client/components/Pixi';
import { ENTITIES_LAYER, MAP_LAYERS, TILE_SIZE } from '@bao/core';
import { DisplayObject } from 'pixi.js';

import { SetStateCallback, useLocalStateReducer } from '@bao/client/hooks';

export interface MapSystemState {
  groups: Group[];
}

export interface MapContextState {
  setMapState: SetStateCallback<MapSystemState> | null;
  mapState: MapSystemState;
}

export const createInitialMapState = (): MapSystemState => ({
  groups: []
});

export const MapContext = createContext<MapContextState>({
  setMapState: null,
  mapState: createInitialMapState()
});

export const useMapContext = () => {
  return useContext(MapContext);
};

export const MapRenderingSystem: React.FC = ({ children }) => {
  const [mapState, setMapState] = useLocalStateReducer(createInitialMapState());
  const handleLayerSort = useCallback((obj: DisplayObject) => {
    return (obj.zOrder = obj.y + (obj.height || TILE_SIZE));
  }, []);

  useEffect(() => {
    const groups: Group[] = [];
    for (const index of range(0, MAP_LAYERS + 1)) {
      const group = new Group(index, true);
      if (index === ENTITIES_LAYER) {
        group.on('sort', handleLayerSort);
      }
      groups.push(group);
    }

    setMapState({ groups });

    return () => {
      const entitiesGroup = groups[ENTITIES_LAYER];
      if (entitiesGroup) {
        entitiesGroup.off('sort', handleLayerSort);
      }
    };
  }, [handleLayerSort]);

  return (
    <MapContext.Provider value={{ mapState, setMapState }}>
      <Stage enableSort>
        {mapState.groups.map((layer, index) => (
          <Layer key={index} group={layer} />
        ))}
        {Boolean(mapState.groups.length) && children}
        {Boolean(mapState.groups.length) && <LayersStageUpdate />}
      </Stage>
    </MapContext.Provider>
  );
};
