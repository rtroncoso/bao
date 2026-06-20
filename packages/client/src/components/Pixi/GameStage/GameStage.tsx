import { Stage } from '@inlet/react-pixi';
import type { Application } from 'pixi.js';
import React, { useEffect, useState } from 'react';

export interface GameStageProps {
  width: number;
  height: number;
  children: React.ReactNode;
}

const destroyApp = (app: Application) => {
  try {
    app.ticker?.stop();
  } catch {
    // Stage may already be partially torn down during navigation.
  }
};

/**
 * Client-only wrapper around @inlet/react-pixi Stage.
 * The library targets React 17; defer mounting until the browser is ready.
 */
export const GameStage = ({ width, height, children }: GameStageProps) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    return () => setReady(false);
  }, []);

  if (!ready) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-black text-sm text-zinc-400"
        aria-busy
      >
        Iniciando motor gráfico…
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Stage
        width={width}
        height={height}
        onUnmount={destroyApp}
        options={{
          antialias: false,
          autoDensity: true,
          powerPreference: 'high-performance',
          resolution:
            typeof window !== 'undefined'
              ? Math.min(window.devicePixelRatio || 1, 1.5)
              : 1
        }}
      >
        {children}
      </Stage>
    </div>
  );
};
