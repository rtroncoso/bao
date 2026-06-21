/** AO class name (uppercase) → classes.old_name */
export const CLASS_OLD_NAMES = {
  MAGO: "mago",
  CLERIGO: "clerigo",
  GUERRERO: "guerrero",
  ASESINO: "asesino",
  LADRON: "ladron",
  BARDO: "bardo",
  DRUIDA: "druida",
  BANDIDO: "bandido",
  PALADIN: "paladin",
  CAZADOR: "cazador",
  TRABAJADOR: "trabajador",
  PIRATA: "pirata",
};

/** classes.old_name → id (from 2020-11-09_full.sql) */
export const CLASS_IDS = {
  mago: 1,
  clerigo: 2,
  guerrero: 3,
  asesino: 4,
  ladron: 5,
  bardo: 6,
  druida: 7,
  bandido: 8,
  paladin: 9,
  cazador: 10,
  trabajador: 11,
  pirata: 12,
};

export const resolveClassId = (className: unknown): number | null => {
  const normalized = String(className ?? "")
    .trim()
    .toUpperCase();
  const oldName = CLASS_OLD_NAMES[normalized as keyof typeof CLASS_OLD_NAMES];
  return oldName ? CLASS_IDS[oldName as keyof typeof CLASS_IDS] : null;
};
