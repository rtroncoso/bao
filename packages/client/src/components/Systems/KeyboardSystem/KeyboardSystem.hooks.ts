import { useEffect, useRef, useState } from 'react';
import { useChatContext } from 'src/components/Chat';

import { movementInputRef } from '@bao/client/lib/movement-input';

const EMPTY_KEYS: string[] = [];

export function useKeyPress(targetKey: string) {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = ({ key }: { key: string }) => {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = ({ key }: { key: string }) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
}

export function usePressedKeys() {
  const [keys, setKeys] = useState<string[]>([]);
  const { state } = useChatContext();
  const chatFocusedRef = useRef(state.focused);
  chatFocusedRef.current = state.focused;

  useEffect(() => {
    if (state.focused) {
      movementInputRef.current = [];
      setKeys([]);
    }
  }, [state.focused]);

  useEffect(() => {
    const downHandler = ({ key }: KeyboardEvent) => {
      if (chatFocusedRef.current) {
        return;
      }

      const lower = key.toLowerCase();
      setKeys((prev) => {
        if (prev.includes(lower)) {
          return prev;
        }
        const next = [...prev, lower];
        movementInputRef.current = next;
        return next;
      });
    };

    const upHandler = ({ key }: KeyboardEvent) => {
      if (chatFocusedRef.current) {
        return;
      }

      const lower = key.toLowerCase();
      setKeys((prev) => {
        const next = prev.filter((k) => k !== lower);
        movementInputRef.current = next;
        return next;
      });
    };

    const blurHandler = () => {
      movementInputRef.current = [];
      setKeys([]);
    };

    window.addEventListener('blur', blurHandler);
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('blur', blurHandler);
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  return state.focused ? EMPTY_KEYS : keys;
}
