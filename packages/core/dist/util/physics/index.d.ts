import { Physics as BumpPhysics } from '@lcluber/bumpjs';
export interface CreateBodyParameters {
    x: number;
    y: number;
    width: number;
    height: number;
    mass?: number;
    damping?: number;
    restitution?: number;
    type?: ShapeTypes;
}
export declare const Shapes: {
    CIRCLE: string;
    RECTANGLE: string;
};
export type ShapeTypes = typeof Shapes.CIRCLE | typeof Shapes.RECTANGLE;
export declare const createBody: ({ x, y, width, height, mass, damping, restitution, type }: {
    x: any;
    y: any;
    width: any;
    height: any;
    mass?: number;
    damping?: number;
    restitution?: number;
    type?: string;
}) => BumpPhysics;
export declare const createRectangle: ({ type, ...props }: CreateBodyParameters) => BumpPhysics;
export declare const createCircle: ({ type, ...props }: CreateBodyParameters) => BumpPhysics;
//# sourceMappingURL=index.d.ts.map