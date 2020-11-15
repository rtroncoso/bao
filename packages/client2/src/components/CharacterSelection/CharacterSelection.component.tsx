import React from 'react';
import { RouteProps } from 'react-router-dom';

import { ContainerStyled } from '@mob/client/components/App/App.styles';
import { ConnectedProps } from './CharacterSelection.container';

type CharacterSelectionProps =
  ConnectedProps &
  Readonly<RouteProps>;

const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  account,
  characters
}) => {
  return (
    <ContainerStyled>
      <h1 className="font-mono text-2xl text-center text-indigo-800 text-bold">
        ¡Bienvenido, {account!.username}!
      </h1>
      <h2 className="text-lg text-center text-indigo-800">
        Seleccioná un personaje
      </h2>
      <ul className="w-full h-full mt-6">
        {characters.map((character) => (
          <li
            key={character.id}
            className="mt-4 text-lg text-center text-gray-300 duration-200 bg-indigo-600 rounded shadow-outline cursor-pointer tbransition-colors p text-bold hover:bg-indigo-700 hover:text-gray-400 first:mt-0"
            role="button"
          >
            {character.name}
          </li>
        ))}
      </ul>
    </ContainerStyled>
  );
}

export default CharacterSelection;
