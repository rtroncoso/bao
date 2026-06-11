export const SOUTH = 0;
export const EAST = 1;
export const NORTH = 2;
export const WEST = 3;
export const HEADINGS: ['down', 'right', 'up', 'left'] = ['down', 'right', 'up', 'left'];

export type Headings = 'south' | 'east' | 'north' | 'west';
export enum Heading {
  SOUTH,
  EAST,
  NORTH,
  WEST
}

/** Argentum Online NPCs.dat Heading 1–4 (N/E/S/W). Engine uses 0–3. */
export const legacyHeadingToHeading = (legacy: number): Heading => {
  switch (legacy) {
    case 1:
      return Heading.NORTH;
    case 2:
      return Heading.EAST;
    case 3:
      return Heading.SOUTH;
    case 4:
      return Heading.WEST;
    default:
      if (legacy >= Heading.SOUTH && legacy <= Heading.WEST) {
        return legacy as Heading;
      }
      return Heading.SOUTH;
  }
};
