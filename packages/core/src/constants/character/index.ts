import s from './character.styles.json';
import r from './character.roles.json';
import { TextStyle } from 'pixi.js';
export const styles = s;
export const roles = r;

export const CHARACTER_NAME_STYLES = {
  [roles.user]: new TextStyle({
    ...styles.name,
    fill: styles.privilegeColors.user,
    fontWeight: 'bold',
    align: 'center'
  }),
  [roles.admin]: new TextStyle({
    ...styles.name,
    fill: styles.privilegeColors.admin,
    fontWeight: 'bold',
    align: 'center'
  })
};

export const CHARACTER_CHAT_STYLES = {
  [roles.user]: new TextStyle({
    ...styles.name,
    fontWeight: 'bold',
    align: 'center'
  }),
  [roles.admin]: new TextStyle({
    ...styles.name,
    fill: styles.privilegeColors.admin,
    fontWeight: 'bold',
    align: 'center'
  })
};
