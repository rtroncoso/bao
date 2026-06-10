import { useEffect, useRef, useState } from 'react';
import { useChatContext } from 'src/components/Chat';

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
      setKeys([]);
    }
  }, [state.focused]);

  useEffect(() => {
    const downHandler = ({ key }: KeyboardEvent) => {
      if (chatFocusedRef.current) {
        return;
      }

      const lower = key.toLowerCase();
      setKeys((prev) => (prev.includes(lower) ? prev : [...prev, lower]));
    };

    const upHandler = ({ key }: KeyboardEvent) => {
      if (chatFocusedRef.current) {
        return;
      }

      const lower = key.toLowerCase();
      setKeys((prev) => prev.filter((k) => k !== lower));
    };

    const blurHandler = () => setKeys([]);

    window.addEventListener('blur', blurHandler);
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('blur', blurHandler);
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  return state.focused ? [] : keys;
}
