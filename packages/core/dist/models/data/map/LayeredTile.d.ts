import { Graphic } from '@mob/core/models';
import { Tile } from './Tile';
/**
 * LayeredTile model
 */
export declare class LayeredTile extends Tile {
    graphics: Graphic[];
    constructor({ graphics, ...options }: {
        [x: string]: any;
        graphics?: any[];
    });
}
//# sourceMappingURL=LayeredTile.d.ts.map