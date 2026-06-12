import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

import { TILE_SIZE } from '@bao/core';
import { useGameContext } from '@bao/client/components/Game/Game.context';
import { useChatContext } from '@bao/client/components/Chat';
import { resolveLocalCharacter } from '@bao/client/components/Systems/ViewportSystem';

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
  const { state: gameState } = useGameContext();
  const { state: chatState } = useChatContext();
  const [headDisplayByNpcId, setHeadDisplayByNpcId] = useState<
    Record<string, NpcHeadDisplay | undefined>
  >({});

  const localCharacter = resolveLocalCharacter(
    gameState?.serverState,
    gameState?.characterId,
    gameState?.room?.sessionId
  );

  const isPlayerAdjacentTo = useCallback(
    (mapId: number, x: number, y: number) => {
      if (!localCharacter || localCharacter.mapId !== mapId) {
        return false;
      }

      const charTileX = Math.floor(localCharacter.x / TILE_SIZE);
      const charTileY = Math.floor(localCharacter.y / TILE_SIZE);
      const dx = Math.abs(charTileX - x);
      const dy = Math.abs(charTileY - y);
      return dx <= 1 && dy <= 1 && dx + dy > 0;
    },
    [localCharacter?.mapId, localCharacter?.x, localCharacter?.y]
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
      if (
        chatState.focused ||
        !gameState?.room ||
        !localCharacter?.mapId ||
        !isPlayerAdjacentTo(localCharacter.mapId, x, y)
      ) {
        return;
      }

      gameState.room.send('interact', {
        type: 'object',
        entityId,
        mapId: localCharacter.mapId,
        objectType
      });
    },
    [
      chatState.focused,
      gameState?.room,
      isPlayerAdjacentTo,
      localCharacter?.mapId
    ]
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
