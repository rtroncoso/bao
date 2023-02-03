import { useState, useEffect } from 'react';
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
  const [keys, setKeys] = useState<Array<string>>([]);
  const { state } = useChatContext();

  useEffect(() => {
    if (state.focused && keys.length) {
      setKeys([]);
    }

    const blurHandler = () => {
      setKeys([]);
    };

    const downHandler = ({ key }: { key: string }) => {
      if (!state.focused && keys.indexOf(key.toLowerCase()) === -1) {
        keys.push(key.toLowerCase());
        setKeys([...keys.reverse()]);
      }
    };

    const upHandler = ({ key }: { key: string }) => {
      const index = keys.indexOf(key.toLowerCase());
      if (!state.focused && index !== -1) {
        keys.splice(index, 1);
        setKeys([...keys.reverse()]);
      }
    };

    window.addEventListener('blur', blurHandler);
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('blur', blurHandler);
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [keys, state.focused]);

  return keys;
}
