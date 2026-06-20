/** Dev-only frame budget counters (enable via game debug mode). */

export interface PerfFrameSnapshot {
  syncViewportLayersCalls: number;
  syncViewportLayersMs: number;
  patchListenerCalls: number;
  patchListenerMs: number;
  resolveLocalCharacterCalls: number;
  footstepSyncMs: number;
}

const emptySnapshot = (): PerfFrameSnapshot => ({
  syncViewportLayersCalls: 0,
  syncViewportLayersMs: 0,
  patchListenerCalls: 0,
  patchListenerMs: 0,
  resolveLocalCharacterCalls: 0,
  footstepSyncMs: 0
});

let enabled = false;
let frame = emptySnapshot();

export const setPerfMetricsEnabled = (value: boolean): void => {
  enabled = value;
  if (!value) {
    frame = emptySnapshot();
  }
};

export const isPerfMetricsEnabled = (): boolean => enabled;

export const recordSyncViewportLayers = (durationMs: number): void => {
  if (!enabled) {
    return;
  }
  frame.syncViewportLayersCalls += 1;
  frame.syncViewportLayersMs += durationMs;
};

export const recordPatchListener = (durationMs: number): void => {
  if (!enabled) {
    return;
  }
  frame.patchListenerCalls += 1;
  frame.patchListenerMs += durationMs;
};

export const recordResolveLocalCharacter = (): void => {
  if (!enabled) {
    return;
  }
  frame.resolveLocalCharacterCalls += 1;
};

export const recordFootstepSync = (durationMs: number): void => {
  if (!enabled) {
    return;
  }
  frame.footstepSyncMs += durationMs;
};

/** Swap and return accumulated metrics for the frame, then reset. */
export const flushPerfFrame = (): PerfFrameSnapshot => {
  const snapshot = frame;
  frame = emptySnapshot();
  return snapshot;
};

export const measure = <T>(fn: () => T): [T, number] => {
  const start = performance.now();
  const result = fn();
  return [result, performance.now() - start];
};
