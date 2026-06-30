import { spawnSync, type SpawnSyncReturns } from "child_process";

import { resolveToolCommand } from "./resolveTool.js";

export interface RunToolOptions {
  debug?: boolean;
  timeout?: number;
}

export const runTool = (
  command: string,
  args: string[],
  options: RunToolOptions = {}
): { executable: string; result: SpawnSyncReturns<Buffer> } => {
  const executable = resolveToolCommand(command);
  const result = spawnSync(executable, args, {
    timeout: options.timeout ?? 120_000,
    windowsHide: true,
    stdio: options.debug ? "inherit" : ["ignore", "pipe", "pipe"],
    maxBuffer: 16 * 1024 * 1024,
  });

  return { executable, result };
};

export const formatSpawnFailure = (
  executable: string,
  args: string[],
  result: SpawnSyncReturns<Buffer>
) => {
  const parts = [
    `${executable} ${args.map((arg) => JSON.stringify(arg)).join(" ")}`,
  ];

  if (result.error) {
    parts.push(result.error.message);
  } else if (result.status !== null && result.status !== 0) {
    parts.push(`exit code ${result.status}`);
  } else if (result.signal) {
    parts.push(`signal ${result.signal}`);
  }

  const stderr = result.stderr?.toString().trim();
  if (stderr) {
    parts.push(stderr);
  }

  return parts.join("\n");
};
