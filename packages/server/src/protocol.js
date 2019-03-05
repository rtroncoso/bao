import Player from './player';

// TODO : Move to helpers
const getMessage = (socket, messageId) => {
  // Get first message of conversation
  this.game.sequelize.query(
    `SELECT message_id, text, type_id FROM npcd_messages
            WHERE message_id = :message_id LIMIT 1`,
    {
      replacements: { messageId },
      type: this.game.sequelize.QueryTypes.SELECT
    }
  ).then((message) => {
    console.log(message);

    // If its a "question", get answers/options.
    const p1 = new Promise((resolve, reject) => {
      if (message[0].type_id === 2) {
        console.log('es pregunta');
        this.game.sequelize.query(
          `SELECT text, next_message_id FROM npcd_answers
                  WHERE message_id = :message_id`,
          {
            replacements: { messageId: message[0].messageId },
            type: this.game.sequelize.QueryTypes.SELECT
          }
        ).then((answers) => {
          console.log('rtas:');
          message[0].answers = answers;
          resolve(message);
        });
      } else {
        resolve(message);
      }
    });

    p1.then((pMessage) => {
      console.log('msg con rtas:');
      console.info(pMessage);

      socket.emit('NPCResponseUser', pMessage[0]);
    });
  });
};

export default class Protocol {
  constructor(game) {
    this.game = game;
    this.listen(game.io.sockets);
  }

  listen(sockets) {
    sockets.on('connection', (socket) => {
      console.log('connection');
      console.log(socket.id);
      this.game.PLAYER_LIST[socket.id] = new Player();

      console.log(this.game.PLAYER_LIST[socket.id]);
      console.log(this.game.PLAYER_LIST);

      // Protocol.onConnect(socket);

      socket.on('Walk', (direction) => {
        console.log('walk package');
        console.log(socket.id);
        console.log(this.game.PLAYER_LIST);
        const player = this.game.PLAYER_LIST[socket.id];
        player.move(direction);
      });

      socket.on('disconnect', () => {
        delete this.game.SOCKET_LIST[socket.id];
        // Protocol.onDisconnect(socket);
      });

      socket.on('talkToNPC', (npcId) => {
        // test:
        this.writeConsoleMsg(socket.id, {
          msg: 'Testeando...',
          color: 'RGB(65,190,156)',
          class: 'normal'
        });

        // hardcoded - testing
        let conversationId = 0;
        if (npcId === 1) conversationId = 1;

        // Get first message of conversation
        this.game.sequelize.query(
          `SELECT message_id, text, type_id FROM npcd_messages 
            WHERE conversation_id = :conversation_id LIMIT 1`,
          {
            replacements: { conversationId },
            type: this.game.sequelize.QueryTypes.SELECT
          }
        ).then((message) => {
          // If its a "question", get answers/options.
          if (message.type_id === 2) {
            this.game.sequelize.query(
              `SELECT text FROM npcd_answers WHERE message_id = :message_id`,
              {
                replacements: { message_id: message.message_id },
                type: this.game.sequelize.QueryTypes.SELECT
              }
            ).then((answers) => {
              console.log(answers);
              message[0].answers = answers;
            });
          }

          socket.emit('NPCResponseUser', message[0]);
        });
      });

      socket.on('UserResponseNPC', (data) => {
        if (data.answer === '') {
          this.game.sequelize.query(
            `SELECT next_message_id FROM npcd_messages WHERE message_id = :message_id`,
            {
              replacements: { message_id: data.message_id },
              type: this.game.sequelize.QueryTypes.SELECT
            }
          ).then((message) => {
            getMessage(socket, message[0].next_message_id);
          });
        } else {
          this.game.sequelize.query(
            `SELECT next_message_id FROM npcd_answers
              WHERE message_id = :message_id LIMIT 1 OFFSET :answer_num`,
            {
              replacements: {
                message_id: data.message_id,
                answer_num: (parseInt(data.answer, 10) - 1)
              },
              type: this.game.sequelize.QueryTypes.SELECT
            }
          ).then((message) => {
            getMessage(message[0].next_message_id);
          });
        }
      });

      socket.on('sendMsgToServer', (data) => {
        // If first character is a slash (/) we are looking for a command.
        if (data.charAt(0) === '/') {
          // Split. Take [0] as command, [1] as arg1, etc.
          const splitted = data && data.split(' ');
          const command = splitted[0].toLowerCase();

          switch (command) {
          case '/meditar':
            this.writeConsoleMsg(socket.id, {
              msg: 'Comienzas a meditar...',
              color: 'RGB(65,190,156)',
              class: 'normal'
            });
            break;

          case '/comerciar':
            console.log('comerciando!');
            break;

          default:
            console.log('comando invalido!');
          }
        } else {
          const playerName = (`${socket.id}`);
          for (const index in this.game.SOCKET_LIST) {
            if (index) {
              this.writeConsoleMsg(index, {
                msg: `${playerName}> ${data}`,
                color: '#fff',
                class: 'normal'
              });
            }
          }
        }
      });
    });
  }

  writeConsoleMsg(UserIndex, msg) {
    this.game.SOCKET_LIST[UserIndex].emit('addToChat', msg);
  }
}
