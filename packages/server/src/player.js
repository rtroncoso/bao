// TODO: this is a constant! move to mod declares!
const eHeading = {
  NORTH: 1,
  EAST: 2,
  SOUTH: 3,
  WEST: 4,
};

export default class Player { // extends Entity {
  constructor() {
    this.x = 0;
    this.y = 0;

    return this;
  }

  move(direction) {
    if (eHeading[direction] === undefined) {
      // invalid head direction.
      return false;
    }

    console.log(`${this.x}-${this.y}`);

    // We always change heading, user can rotate on its own axis.
    this.heading = eHeading[direction];

    switch (direction) {
    case 'NORTH':
      this.y--;
      break;
    case 'SOUTH':
      this.y++;
      break;
    case 'EAST':
      this.x++;
      break;
    case 'WEST':
      this.x--;
      break;
    default:
      break;
    }

    return this;
  }
}
