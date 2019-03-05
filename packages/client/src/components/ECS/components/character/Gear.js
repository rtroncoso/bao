export const BODY = 'body';
export const HEAD = 'head';
export const HELMET = 'helmet';
export const SHIELD = 'shield';
export const WEAPON = 'weapon';

export default class Gear {
  constructor() {
    this[BODY] = null;
    this[HEAD] = null;
    this[HELMET] = null;
    this[SHIELD] = null;
    this[WEAPON] = null;
  }
}
