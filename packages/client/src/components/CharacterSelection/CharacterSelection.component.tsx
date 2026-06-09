import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';

import {
  AuthCard,
  Button,
  PageShell,
  SelectableOption,
  SiteHeader
} from '@bao/ui';

import { CharacterModel } from '@bao/client/queries/account';
import { CharacterSelectionConnectedProps } from './CharacterSelection.container';

const CharacterSelection = ({
  account,
  characters
}: CharacterSelectionConnectedProps) => {
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

  const selectedName = currentCharacter?.name;

  return (
    <PageShell width="lg">
      <SiteHeader
        title="BAO"
        subtitle={`Bienvenido de vuelta, ${account?.username ?? 'jugador'}.`}
      />
      <AuthCard
        title="Elegí tu personaje"
        description="Seleccioná un personaje existente o creá uno nuevo para entrar al mundo."
      >
        {characters.length > 0 ? (
          <ul className="space-y-2">
            {characters.map((character) => (
              <li key={character.id}>
                <SelectableOption
                  selected={currentCharacter?.id === character.id}
                  onClick={() => handleCharacterSelection(character)}
                >
                  <span>{character.name}</span>
                  {currentCharacter?.id === character.id && (
                    <span className="text-xs font-normal text-muted-foreground">
                      Seleccionado
                    </span>
                  )}
                </SelectableOption>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Todavía no tenés personajes. Creá uno para empezar a jugar.
          </p>
        )}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          {characters.length > 0 && (
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!currentCharacter}
            >
              {selectedName
                ? `Entrar con ${selectedName}`
                : 'Seleccioná un personaje'}
            </Button>
          )}
          <Button
            className="flex-1"
            variant={characters.length > 0 ? 'outline' : 'default'}
            onClick={handleCharacterCreation}
          >
            Crear personaje
          </Button>
        </div>
      </AuthCard>
    </PageShell>
  );
};

export default CharacterSelection;
