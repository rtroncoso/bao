import s from './character.styles.json';
import r from './character.roles.json';
export const styles = s;
export const roles = r;

export const CHARACTER_ROLE_STYLES = {
  [roles.user]: { ...styles.name, fill: styles.privilegeColors[roles.user] },
  [roles.admin]: { ...styles.name, fill: styles.privilegeColors[roles.admin] }
};

export default null;
