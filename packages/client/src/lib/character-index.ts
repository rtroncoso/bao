import { CharacterState } from '@bao/server/schema/CharacterState';

const sessionCharacterIndex = new Map<string, CharacterState>();

export const rebuildCharacterIndex = (
  characters: CharacterState[] | undefined
): void => {
  sessionCharacterIndex.clear();
  if (!characters) {
    return;
  }

  for (const character of characters) {
    if (character.sessionId) {
      sessionCharacterIndex.set(character.sessionId, character);
    }
  }
};

export const getCharacterBySessionId = (
  sessionId: string
): CharacterState | undefined => sessionCharacterIndex.get(sessionId);

export const clearCharacterIndex = (): void => {
  sessionCharacterIndex.clear();
};
