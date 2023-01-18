export const RECTANGLE: "rectangle";
export const CIRCLE: "circle";
export function createBody({ x, y, width, height, mass, damping, restitution, type }: {
    x: any;
    y: any;
    width: any;
    height: any;
    mass?: number;
    damping?: number;
    restitution?: number;
    type?: string;
}): BumpPhysics;
export function createRectangle({ type, ...props }: {
    [x: string]: any;
    type?: string;
}): BumpPhysics;
export function createCircle({ type, ...props }: {
    [x: string]: any;
    type?: string;
}): BumpPhysics;
declare const _default: any;
export default _default;
import { Physics as BumpPhysics } from "@lcluber/bumpjs";
//# sourceMappingURL=index.d.ts.map