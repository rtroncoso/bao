import { Loader } from 'pixi.js';

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

export type AnimationsEntityModel = Array<Graphic>;

export interface GraphicsEntityModel {
  [key: string]: Graphic;
}
export interface BodiesEntityModel {
  [key: string]: Body;
}

export interface LoadAssetsPayload extends AuthorizedRequestPayload {
  loader: Loader;
}

export interface LoadManifestPayload extends LoadAssetsPayload {}

export interface LoadBodiesPayload extends LoadManifestPayload {
  animations: AnimationsEntityModel;
  graphics: GraphicsEntityModel;
  manifest: ManifestModel;
}
export interface LoadGraphicsPayload extends LoadAssetsPayload {
  manifest: ManifestModel;
}

export interface AssetEntities {
  animations?: AnimationsEntityModel;
  bodies?: BodiesEntityModel;
  graphics?: GraphicsEntityModel;
  manifest?: ManifestModel;
}
