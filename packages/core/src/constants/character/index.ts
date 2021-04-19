import s from './character.styles.json';
import r from './character.roles.json';
export const styles = s;
export const roles = r;

export const CHARACTER_ROLE_STYLES = {
  [roles.user]: { ...styles.name, fill: '#ffebb6' },
  [roles.admin]: { ...styles.name, fill: '#16b601' }
};
