import { AuthorizedRequestParameters as AuthorizedRequestPayload } from '@mob/client/queries/shared/models';

export interface BodyModel {
  down: number;
  headOffsetX: number;
  headOffsetY: number;
  id: number;
  left: number;
  right: number;
  up: number;
}

export type BodiesModel = Array<number | BodyModel>;

export interface GraphicModel {
  fileName: string | number;
  height: number;
  id: string | number;
  width: number;
  x: number;
  y: number;
}

export interface AnimatedGraphicModel {
  frames: Array<number>;
  id: string | number;
  speed: number;
}

export type GraphicsModel = Array<number | GraphicModel | AnimatedGraphicModel>;

export interface ManifestModel {
  audio: {
    [key: string]: string;
  };
  init: {
    bodies: string;
    effects: string;
    graphics: string;
    heads: string;
    helmets: string;
    objects: string;
    shields: string;
    weapons: string;
  };
  maps: {
    [key: string]: string;
  };
  textures: {
    animations: Array<string>;
    graphics: Array<string>;
  };
}

export interface LoadBodiesPayload extends AuthorizedRequestPayload {
  manifest: ManifestModel;
}
export interface LoadGraphicsPayload extends AuthorizedRequestPayload {
  manifest: ManifestModel;
}

export interface LoadManifestPayload extends AuthorizedRequestPayload {}

export interface AssetEntities {
  bodies?: BodiesModel;
  graphics?: GraphicsModel;
  manifest?: ManifestModel;
}
