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

// { force: true } will drop the table if it already exists
// Users
User.sync();

// Assets
Graphic.sync();

// Character
Class.sync();
Race.sync();
Skill.sync();

// Objects
ObjectType.sync();
Object.sync();
Attribute.sync();
ObjectAttribute.sync();
ObjectClasses.sync();

const port = parseInt(process.env.PORT, 10) || 8000;

app.listen(port, () => {
  console.log(`The server is running at localhost: ${port}`);
});

module.exports = app;
