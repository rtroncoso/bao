const app = require('./config/express');
const User = require('./src/models/User');
const Graphic = require('./src/models/asset/Graphic');
const Class = require('./src/models/character/Class');
const Race = require('./src/models/character/Race');
const Skill = require('./src/models/character/Skill');
const Object = require('./src/models/object/Object');
const Attribute = require('./src/models/object/Attribute');
const ObjectAttribute = require('./src/models/object/ObjectAttribute');
const ObjectClasses = require('./src/models/object/ObjectClasses');
const ObjectType = require('./src/models/object/ObjectType');
const { sequelize } = require('./config/sequelize');

// { force: true } will drop the table if it already exists
sequelize.sync();

const port = parseInt(process.env.PORT, 10) || 8000;

const server = app.listen(port, () => {
  console.log(`The server is running at localhost: ${port}`);
});

function stop() {
  server.close();
}

module.exports = app;
module.exports.stop = stop;
