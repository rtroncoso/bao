import { AuthorizedRequestParameters as AuthorizedRequestPayload } from '@mob/client/queries/shared/models';
import { JsonBodiesModel, JsonGraphicsModel } from '@mob/core/loaders';

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
  bodies?: JsonBodiesModel;
  graphics?: JsonGraphicsModel;
  manifest?: ManifestModel;
}
