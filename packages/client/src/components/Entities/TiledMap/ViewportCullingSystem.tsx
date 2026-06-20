import { useTick } from '@inlet/react-pixi';
import React from 'react';

import { useViewportContext } from '@bao/client/components/Systems';
import {
  cullMovementThresholdPx,
  getMapCullEntries,
  projectionIntersectsMap
} from './viewport-culling-registry';

/** Single Pixi tick that culls all registered map layers. */
export const ViewportCullingSystem: React.FC = () => {
  const { projectionRef } = useViewportContext();

  useTick(() => {
    const projection = projectionRef.current;
    const entries = getMapCullEntries();

    for (const entry of entries) {
      const visible = projectionIntersectsMap(projection, entry);
      entry.setVisible(visible);

      if (!visible || !entry.isReady()) {
        continue;
      }

      const { x, y } = projection;
      const last = entry.lastCull;
      const threshold = cullMovementThresholdPx(entry.borderOnly);

      if (
        last &&
        Math.abs(x - last.x) < threshold &&
        Math.abs(y - last.y) < threshold
      ) {
        continue;
      }

      entry.lastCull = { x, y };
      entry.sync(projection);
    }
  });

  return null;
};
