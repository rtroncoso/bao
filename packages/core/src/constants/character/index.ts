import s from './character.styles.json';
import r from './character.roles.json';
import { TextStyle } from 'pixi.js';
export const styles = s;
export const roles = r;

export const CHARACTER_ROLE_STYLES = {
  [roles.user]: new TextStyle({ ...styles.name, fill: '#ffebb6', fontWeight: 'bold' }),
  [roles.admin]: new TextStyle({ ...styles.name, fill: '#16b601', fontWeight: 'bold' })
};
