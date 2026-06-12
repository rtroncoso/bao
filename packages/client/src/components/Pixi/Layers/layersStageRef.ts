import { Stage as PixiStage } from '@pixi/layers';

/** Live @pixi/layers Stage instance — set by the custom Stage PixiComponent. */
export const layersStageRef: { current: PixiStage | null } = { current: null };
