import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const toolCache = new Map<string, string>();

const windowsPathEntries = (): string[] => {
  const entries = new Set<string>();

  for (const value of [
    process.env.PATH,
    process.env.Path,
    process.env.ChocolateyInstall
      ? path.join(process.env.ChocolateyInstall, "bin")
      : null,
    "C:\\ProgramData\\chocolatey\\bin",
  ]) {
    if (!value) {
      continue;
    }

    for (const entry of value.split(path.delimiter)) {
      if (entry) {
        entries.add(entry);
      }
    }
  }

  return [...entries];
};

const pathEntries = (): string[] =>
  process.platform === "win32"
    ? windowsPathEntries()
    : (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);

const executableName = (name: string) =>
  process.platform === "win32" && !name.toLowerCase().endsWith(".exe")
    ? `${name}.exe`
    : name;

const findOnPath = (name: string): string | null => {
  const fileName = executableName(name);

  for (const dir of pathEntries()) {
    const candidate = path.join(dir, fileName);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
};

const findWithWhere = (name: string): string | null => {
  if (process.platform !== "win32") {
    return null;
  }

  const whereExe = path.join(
    process.env.SystemRoot ?? "C:\\Windows",
    "System32",
    "where.exe"
  );

  if (!fs.existsSync(whereExe)) {
    return null;
  }

  const result = spawnSync(whereExe, [name], {
    encoding: "utf8",
    windowsHide: true,
    stdio: ["ignore", "pipe", "ignore"],
  });

  if (result.status !== 0 || !result.stdout) {
    return null;
  }

  const first = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return first && fs.existsSync(first) ? first : null;
};

export const resolveToolCommand = (name: string): string => {
  const cached = toolCache.get(name);
  if (cached) {
    return cached;
  }

  const resolved = findWithWhere(name) ?? findOnPath(name) ?? name;
  toolCache.set(name, resolved);
  return resolved;
};

export const clearToolCommandCache = () => {
  toolCache.clear();
};
