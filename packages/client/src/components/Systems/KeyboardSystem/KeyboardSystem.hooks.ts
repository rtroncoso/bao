import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const blurHandler = () => {
      setKeys([]);
    };

    const downHandler = ({ key }: { key: string }) => {
      if (keys.indexOf(key) === -1) {
        keys.push(key);
        setKeys([...keys]);
      }
    };

    const upHandler = ({ key }: { key: string }) => {
      const index = keys.indexOf(key);
      if (index !== -1) {
        keys.splice(index, 1);
        setKeys([...keys]);
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
  }, [keys]);

  return keys;
}
