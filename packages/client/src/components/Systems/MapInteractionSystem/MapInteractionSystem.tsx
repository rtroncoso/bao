import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

import { TILE_SIZE } from '@bao/core';
import {
  gameRoomRef,
  localCharacterRef
} from '@bao/client/lib/game-server-state';
import { useChatContext } from '@bao/client/components/Chat';

export interface NpcHeadDisplay {
  text: string;
  token: number;
}

export interface MapInteractionContextValue {
  headDisplayByNpcId: Record<string, NpcHeadDisplay | undefined>;
  onNpcClick: (entityId: string, description: string) => void;
  onObjectClick: (
    entityId: string,
    x: number,
    y: number,
    objectType: number
  ) => void;
  clearNpcHeadDisplay: (entityId: string) => void;
  isPlayerAdjacentTo: (mapId: number, x: number, y: number) => boolean;
}

const MapInteractionContext = createContext<MapInteractionContextValue>({
  headDisplayByNpcId: {},
  onNpcClick: () => {},
  onObjectClick: () => {},
  clearNpcHeadDisplay: () => {},
  isPlayerAdjacentTo: () => false
});

export const useMapInteractionContext = () => useContext(MapInteractionContext);

export const MapInteractionProvider: React.FC = ({ children }) => {
  const { state: chatState } = useChatContext();
  const [headDisplayByNpcId, setHeadDisplayByNpcId] = useState<
    Record<string, NpcHeadDisplay | undefined>
  >({});

  const isPlayerAdjacentTo = useCallback(
    (mapId: number, x: number, y: number) => {
      const localCharacter = localCharacterRef.current;
      if (!localCharacter || localCharacter.mapId !== mapId) {
        return false;
      }

      const charTileX = Math.floor(localCharacter.x / TILE_SIZE);
      const charTileY = Math.floor(localCharacter.y / TILE_SIZE);
      const dx = Math.abs(charTileX - x);
      const dy = Math.abs(charTileY - y);
      return dx <= 1 && dy <= 1 && dx + dy > 0;
    },
    []
  );

  const clearNpcHeadDisplay = useCallback((entityId: string) => {
    setHeadDisplayByNpcId((current) => {
      if (!current[entityId]) {
        return current;
      }

      const next = { ...current };
      delete next[entityId];
      return next;
    });
  }, []);

  const onNpcClick = useCallback((entityId: string, description: string) => {
    if (!description?.trim()) {
      return;
    }

    setHeadDisplayByNpcId((current) => ({
      ...current,
      [entityId]: {
        text: description,
        token: Date.now()
      }
    }));
  }, []);

  const onObjectClick = useCallback(
    (entityId: string, x: number, y: number, objectType: number) => {
      const room = gameRoomRef.current;
      const localCharacter = localCharacterRef.current;

      if (
        chatState.focused ||
        !room ||
        !localCharacter?.mapId ||
        !isPlayerAdjacentTo(localCharacter.mapId, x, y)
      ) {
        return;
      }

      room.send('interact', {
        type: 'object',
        entityId,
        mapId: localCharacter.mapId,
        objectType
      });
    },
    [chatState.focused, isPlayerAdjacentTo]
  );

  const value = useMemo(
    () => ({
      headDisplayByNpcId,
      onNpcClick,
      onObjectClick,
      clearNpcHeadDisplay,
      isPlayerAdjacentTo
    }),
    [
      headDisplayByNpcId,
      onNpcClick,
      onObjectClick,
      clearNpcHeadDisplay,
      isPlayerAdjacentTo
    ]
  );

  return (
    <MapInteractionContext.Provider value={value}>
      {children}
    </MapInteractionContext.Provider>
  );
};

export const MapInteractionSystem: React.FC = ({ children }) => (
  <MapInteractionProvider>{children}</MapInteractionProvider>
);
