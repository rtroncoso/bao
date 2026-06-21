declare module "cli-progress" {
  export class SingleBar {
    constructor(options?: unknown, preset?: unknown);
    start(total: number, startValue: number): void;
    increment(): void;
    stop(): void;
  }

  const cliProgress: {
    SingleBar: typeof SingleBar;
    Presets: { shades_classic: unknown };
  };

  export default cliProgress;
}
