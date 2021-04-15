import React, { useCallback, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { ContainerStyled } from '@mob/client/components/App/App.styles';
import { Button } from '@mob/client/components/Button';
import { CharacterModel } from '@mob/client/queries/account';
import { ConnectedProps } from './CharacterSelection.container';
import {
  CharacterListStyled,
  CharacterListItemStyled,
  TitleStyled
} from './CharacterSelection.styles';

type CharacterSelectionProps =
  ConnectedProps &
  Readonly<RouteComponentProps>;

const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  account,
  characters,
  history
}) => {
  const [currentCharacter, setCurrentCharacter] = useState<CharacterModel | null>(null);

  const handleCharacterSelection = useCallback((character: CharacterModel) => {
    setCurrentCharacter(character);
  }, []);

  const handleCharacterCreation = useCallback(() => {
    history.push('/characters/create')
  }, [history]);

  const handleSubmit = useCallback(() => {
    if (currentCharacter) {
      history.push('/world', { characterId: currentCharacter.id })
    }
  }, [currentCharacter, history]);

  return (
    <ContainerStyled>
      <TitleStyled>
        ¡Bienvenido, {account!.username}!
      </TitleStyled>
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
            ? `Ingresar con ${characters.find((character) => character.id === currentCharacter.id)!.name}`
            : 'Seleccione un personaje'
          }
        </Button>
      )}
      <Button onClick={handleCharacterCreation}>
        Crear personaje
      </Button>
    </ContainerStyled>
  );
}

export default CharacterSelection;
