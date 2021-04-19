import { AuthorizedRequestParameters as AuthorizedRequestPayload } from '@mob/client/queries/shared/models';
import { Body, Graphic } from '@mob/core/models';

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
  graphics: GraphicsEntityModel;
}
export interface LoadGraphicsPayload extends AuthorizedRequestPayload {
  manifest: ManifestModel;
}

export interface LoadManifestPayload extends AuthorizedRequestPayload {}

export interface GraphicsEntityModel {
  [key: string]: Graphic;
}
export interface BodiesEntityModel {
  [key: string]: Body;
}

export interface AssetEntities {
  bodies?: BodiesEntityModel;
  graphics?: GraphicsEntityModel;
  manifest?: ManifestModel;
}
