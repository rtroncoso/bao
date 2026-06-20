import React, { useEffect, useState } from 'react';

import {
  flushPerfFrame,
  setPerfMetricsEnabled,
  type PerfFrameSnapshot
} from '@bao/client/lib/perf-metrics';

const empty = (): PerfFrameSnapshot => ({
  syncViewportLayersCalls: 0,
  syncViewportLayersMs: 0,
  patchListenerCalls: 0,
  patchListenerMs: 0,
  resolveLocalCharacterCalls: 0,
  footstepSyncMs: 0
});

/** Dev overlay — logs per-second perf aggregates when debug mode is on. */
export const PerfMetricsOverlay: React.FC = () => {
  const [snapshot, setSnapshot] = useState<PerfFrameSnapshot>(empty);

  useEffect(() => {
    setPerfMetricsEnabled(true);

    let accumulated = empty();
    let frameCount = 0;

    const onFrame = () => {
      const frame = flushPerfFrame();
      accumulated.syncViewportLayersCalls += frame.syncViewportLayersCalls;
      accumulated.syncViewportLayersMs += frame.syncViewportLayersMs;
      accumulated.patchListenerCalls += frame.patchListenerCalls;
      accumulated.patchListenerMs += frame.patchListenerMs;
      accumulated.resolveLocalCharacterCalls +=
        frame.resolveLocalCharacterCalls;
      accumulated.footstepSyncMs += frame.footstepSyncMs;
      frameCount += 1;
    };

    let rafId = 0;
    const loop = () => {
      onFrame();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const intervalId = setInterval(() => {
      if (frameCount === 0) {
        return;
      }

      setSnapshot({
        syncViewportLayersCalls: Math.round(
          accumulated.syncViewportLayersCalls / frameCount
        ),
        syncViewportLayersMs: Number(
          (accumulated.syncViewportLayersMs / frameCount).toFixed(2)
        ),
        patchListenerCalls: Math.round(
          accumulated.patchListenerCalls / frameCount
        ),
        patchListenerMs: Number(
          (accumulated.patchListenerMs / frameCount).toFixed(2)
        ),
        resolveLocalCharacterCalls: Math.round(
          accumulated.resolveLocalCharacterCalls / frameCount
        ),
        footstepSyncMs: Number(
          (accumulated.footstepSyncMs / frameCount).toFixed(2)
        )
      });

      accumulated = empty();
      frameCount = 0;
    }, 1000);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(intervalId);
      setPerfMetricsEnabled(false);
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute left-2 top-14 z-20 rounded bg-black/75 px-2 py-1 font-mono text-[10px] leading-tight text-green-400"
      aria-hidden
    >
      <div>
        cull: {snapshot.syncViewportLayersCalls}/f{' '}
        {snapshot.syncViewportLayersMs}ms
      </div>
      <div>
        patch: {snapshot.patchListenerCalls}/f {snapshot.patchListenerMs}ms
      </div>
      <div>resolve: {snapshot.resolveLocalCharacterCalls}/f</div>
      <div>foot: {snapshot.footstepSyncMs}ms</div>
    </div>
  );
};
