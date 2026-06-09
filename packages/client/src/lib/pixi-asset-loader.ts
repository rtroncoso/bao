import { Assets } from '@pixi/assets';
import { Spritesheet } from '@pixi/spritesheet';

type LoaderHandler = () => void;
type ProgressHandler = (loader: PixiAssetLoader) => void;

class LoaderSignal<T extends (...args: never[]) => void> {
  private listeners = new Set<T>();

  add(listener: T) {
    this.listeners.add(listener);
    return this;
  }

  remove(listener: T) {
    this.listeners.delete(listener);
  }

  emit(...args: Parameters<T>) {
    this.listeners.forEach((listener) => listener(...args));
  }
}

let assetsInitialized = false;

const ensureAssetsInit = async () => {
  if (!assetsInitialized) {
    await Assets.init();
    assetsInitialized = true;
  }
};

/**
 * Loader-shaped facade over @pixi/assets for legacy redux-saga asset flows.
 */
export class PixiAssetLoader {
  loading = false;
  progress = 0;
  resources: Record<string, Spritesheet | { texture: unknown }> = {};

  onComplete = new LoaderSignal<LoaderHandler>();
  onProgress = new LoaderSignal<ProgressHandler>();

  private pendingUrls: string[] = [];
  private loadPromise: Promise<void> | null = null;

  add(url: string) {
    if (!this.pendingUrls.includes(url)) {
      this.pendingUrls.push(url);
    }
  }

  load() {
    if (this.loadPromise) {
      return;
    }

    this.loadPromise = this.loadAsync().finally(() => {
      this.loadPromise = null;
    });
  }

  destroy() {
    this.pendingUrls = [];
    this.loading = false;
    this.progress = 0;
    this.loadPromise = null;
    this.onComplete = new LoaderSignal<LoaderHandler>();
    this.onProgress = new LoaderSignal<ProgressHandler>();
  }

  private async loadAsync() {
    const urls = [...this.pendingUrls];
    this.pendingUrls = [];

    if (urls.length === 0) {
      if (!this.loading) {
        this.progress = 100;
        this.onComplete.emit();
      }
      return;
    }

    await ensureAssetsInit();

    this.loading = true;
    this.progress = 0;

    try {
      await Assets.load(urls, (ratio) => {
        this.progress = ratio * 100;
        this.onProgress.emit(this);
      });

      for (const url of urls) {
        const asset = Assets.get(url);
        if (asset) {
          this.resources[url] = asset as Spritesheet | { texture: unknown };
        }
      }
    } finally {
      this.loading = false;
      this.progress = 100;
      this.onComplete.emit();
    }
  }
}
