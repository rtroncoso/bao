export function getGraphicsFileName(fileName: any): string;
export function getGraphicsFilePath(fileName: any): string;
export function parseKey(key?: string, keyFormat?: RegExp): string;
export function transform(data: Array<any>, process: (arg0: any) => any): MapObject<any, any>;
export function findAnimation(animations: any, id: any): Graphic;
export function findGraphic(graphics: any, id: any): Graphic;
export function findGraphicsByFileName(graphics: any, fileName: any): Graphic;
export const defaultOrder: any[];
export function parseDirectionGraphicByModel(graphics: any, model: any, order?: any[]): (reducer: {}, props: any, id: any) => any;
export function parseDirectionAnimationByModel(animations: any, model: any, order?: any[]): (reducer: {}, props: any, id: any) => any;
//# sourceMappingURL=util.d.ts.map