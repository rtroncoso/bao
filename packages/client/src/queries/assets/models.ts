import { Loader } from 'pixi.js';

import { AuthorizedRequestPayload } from '@mob/client/queries/shared/models';
import {
  Body,
  Effect,
  Graphic,
  Head,
  Helmet,
  Shield,
  Weapon
} from '@mob/core/models';

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

export interface ResourceEntityModel<T> {
  [key: string]: T;
}

export interface GraphicsEntityModel extends ResourceEntityModel<Graphic> {}
export interface BodiesEntityModel extends ResourceEntityModel<Body> {}
export interface EffectsEntityModel extends ResourceEntityModel<Effect> {}
export interface HelmetsEntityModel extends ResourceEntityModel<Helmet> {}
export interface HeadsEntityModel extends ResourceEntityModel<Head> {}
export interface ShieldsEntityModel extends ResourceEntityModel<Shield> {}
export interface WeaponsEntityModel extends ResourceEntityModel<Weapon> {}

export interface LoadAssetsPayload extends AuthorizedRequestPayload {
  loader: Loader;
}

export interface LoadManifestPayload extends LoadAssetsPayload {}

export interface LoadGraphicsPayload extends LoadAssetsPayload {
  manifest: ManifestModel;
}

export interface LoadResourcePayload extends LoadManifestPayload {
  animations: AnimationsEntityModel;
  graphics: GraphicsEntityModel;
  manifest: ManifestModel;
}

export interface AssetEntities {
  animations?: AnimationsEntityModel;
  bodies?: BodiesEntityModel;
  effects?: EffectsEntityModel;
  graphics?: GraphicsEntityModel;
  heads?: HeadsEntityModel
  helmets?: HelmetsEntityModel
  manifest?: ManifestModel;
  shields?: ShieldsEntityModel;
  weapons?: WeaponsEntityModel;
}
