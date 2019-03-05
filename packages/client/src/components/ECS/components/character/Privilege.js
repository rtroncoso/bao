import { roles } from 'core/constants/character';

export const PRIVILEGE = {
  [roles.user]: 1,
  [roles.admin]: 4,
};

export default function Privilege() {
  this.role = roles.user;
  this.level = PRIVILEGE[roles.user];
}
