export interface SeedOptions {
  datsDir?: string;
  mapsMetaDir?: string;
  outputDir?: string;
  only?: string | null;
  apply?: boolean;
  dryRun?: boolean;
  debug?: boolean;
}

export interface ConvertMapsOptions {
  all?: boolean;
  debug?: boolean;
  dryRun?: boolean;
  inputDir?: string;
  initDir?: string;
  maps?: number[];
  meta?: boolean;
  noCrop?: boolean;
  outputDir?: string;
  publicDir?: string;
  tilesetsType?: string;
  validate?: boolean;
  worlds?: boolean;
}

export interface ConvertAudioOptions {
  sourceDir?: string;
  publicDir?: string;
  music?: string[];
  sfx?: string[];
  ui?: string[];
  all?: boolean;
  dryRun?: boolean;
  debug?: boolean;
}

export interface DeployOptions {
  debug?: boolean;
  environment?: string;
  syncAll?: boolean;
  publicDir?: string;
}

export interface SeedSummaryEntry {
  type: string;
  count: number;
  skipped?: boolean;
  statements: number;
}

export interface ImporterResult {
  statements: string[];
  count: number;
  skipped?: boolean;
}

export interface SeedImporterContext {
  datsDir: string;
  mapsMetaDir: string;
  debug?: boolean;
}
