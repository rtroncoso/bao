import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';

import { ContainerStyled } from '@bao/client/components/App/App.styles';
import { Button } from '@bao/client/components/Button';
import { CharacterModel } from '@bao/client/queries/account';
import { CharacterSelectionConnectedProps } from './CharacterSelection.container';
import {
  CharacterListStyled,
  CharacterListItemStyled,
  TitleStyled
} from './CharacterSelection.styles';

type CharacterSelectionProps = CharacterSelectionConnectedProps;

const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  account,
  characters
}) => {
  const router = useRouter();
  const [currentCharacter, setCurrentCharacter] =
    useState<CharacterModel | null>(null);

  const handleCharacterSelection = useCallback((character: CharacterModel) => {
    setCurrentCharacter(character);
  }, []);

  const handleCharacterCreation = useCallback(() => {
    router.push('/characters/create');
  }, [router]);

  const handleSubmit = useCallback(() => {
    if (currentCharacter) {
      router.push({
        pathname: '/world',
        query: { characterId: currentCharacter.id }
      });
    }
  }, [currentCharacter, router]);

  return (
    <ContainerStyled>
      <TitleStyled>¡Bienvenido, {account?.username}!</TitleStyled>
      <CharacterListStyled>
        {characters.map((character) => (
          <CharacterListItemStyled
            key={character.id}
            isActive={currentCharacter && currentCharacter.id === character.id}
          >
            <button
              className="w-full h-full py-2"
              onClick={() => handleCharacterSelection(character)}
            >
              {character.name}
            </button>
          </CharacterListItemStyled>
        ))}
      </CharacterListStyled>
      {characters.length > 0 && (
        <Button onClick={handleSubmit} disabled={!currentCharacter}>
          {currentCharacter
            ? `Ingresar con ${
                characters.find(
                  (character) => character.id === currentCharacter.id
                )?.name
              }`
            : 'Seleccione un personaje'}
        </Button>
      )}
      <Button onClick={handleCharacterCreation}>Crear personaje</Button>
    </ContainerStyled>
  );
};

export default CharacterSelection;
