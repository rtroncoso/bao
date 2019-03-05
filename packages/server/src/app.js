// DECLARES

import Game from 'server/game';

console.log('¿¿Estás loco?? ¿¿Cómo vas a levantar un server?? :@');
const game = new Game();

/* export const eHeading = {
  NORTH: 1,
  EAST: 2,
  SOUTH: 3,
  WEST: 4
};

export class Stats {

  constructor() {
    this.gold = 1500; //prev 'GLD'.
    this.bank = 1500; //prev 'BANCO'.

    this.minHP = 250; //prev 'MinHp'.
    this.maxHP = 450; //prev 'MaxHp'.

    this.minStamina = 3000; //prev 'MinSTA'.
    this.maxStamina = 3000; //prev 'MaxSTA'.

    this.minMana = 2500; //prev 'MinMAN'.
    this.maxMana = 3000; //prev 'MaxMAN'.

    this.minHit = 95; //prev 'MinHIT'.
    this.maxHit = 175; //prev 'MaxHIT'.

    this.minThrist = 100; //prev 'MinAGU'.
    this.maxThirst = 100; //prev 'MaxAGU'.

    this.minHunger = 80; //prev 'MinHam'.
    this.maxHunger = 100; //prev 'MaxHam'.

    this.skillPts = 25;

    this.level = 45; //prev 'ELV'.
    this.minExp = 675000; //prev 'Exp'.
    this.maxExp = 1500000; //prev 'ELU'.

    this.usersKilled = 0; //prev 'UsuariosMatados'.
    this.npcsKilled = 100; //prev 'NPCsMuertos'.
  }

}

export class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.spdX = 0;
    this.spdY = 0;
    this.id = '';
  }

  update() {
    // this.updatePosition();
  }
}

export class Player extends Entity {

  constructor(id) {
    super();
    this.id = id;

    // Default max speed
    this.maxSpd = 10;

    // Default heading south.
    this.heading = eHeading.SOUTH;

    // Argentum based stats
    this.stats = new Stats();

    PLAYERS_LIST[id] = this;
    initPack.character.push(this.getInitPack());
  }

  move(direction) {
    if (eHeading[direction] === undefined) {
      // invalid head direction.
      return false;
    }

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
    }
  }

  update() {
    super.update();
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y
    }
  }

  getUpdatePack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y
    }
  }

}

export class Protocol {
  static update() {
    let pack = [];
    for (let i in PLAYERS_LIST) {
      const character = PLAYERS_LIST[i];
      character.update();
      pack.push(character.getUpdatePack());
    }
    return pack;
  }

  static onConnect(socket) {
    const character = new Player(socket.id);


    // PROTOCOL:

    // Send Stats to recently connected user.
    socket.emit('UpdateUserStats', PLAYERS_LIST[socket.id].stats);

    // END PROTOCOL.

    let players = [];

    for (let i in PLAYERS_LIST)
      players.push(PLAYERS_LIST[i].getInitPack());

    socket.emit('init',{
      character: players
    });

    // Mensaje de bienvenida
    WriteConsoleMsg(socket.id,
      [
        { msg: 'Bienvenido a ', color: '#fff', class: 'normal' },
        { msg: 'Argentum Saga', color: '#0f0', class: 'bold' },
        { msg: ' guachín.', color: '#fff', class: 'normal' },
      ]
    );
  }

  static onDisconnect(socket) {
    delete PLAYERS_LIST[socket.id];
    removePack.character.push(socket.id);
  }
} */

/* const initPack = { character: [] };
const removePack = { character: [] };

setInterval(() => {
  const pack = {
    character: Protocol.update()
  };

  for (let i in SOCKET_LIST) {
    const socket = SOCKET_LIST[i];

    socket.emit('init', initPack);
    socket.emit('update', pack);
    socket.emit('remove', removePack);
  }

  initPack.character = [];
  removePack.character = [];

}, 1000/25);


//Call WriteConsoleMsg(UserIndex,
'Te acomodás junto a la fogata y comienzas a
descansar.', FontTypeNames.FONTTYPE_INFO)
*/
