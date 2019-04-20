const { sequelize, Sequelize } = require('../../../config/sequelize');
const Graphic = require('../asset/Graphic.js');
const Attribute = require('./Attribute.js');
const ObjectAttribute = require('./ObjectAttribute.js');
const ObjectType = require('./ObjectType.js');

const Object = sequelize.define('Object', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  graphic_id: {
    type: Sequelize.INTEGER,
    foreignKey: true,
    references: {
      model: Graphic,
      key: 'id',
    },
  },
  object_type_id: {
    type: Sequelize.INTEGER,
    foreignKey: true,
    references: {
      model: ObjectType,
      key: 'id',
    },
  },
}, {
  underscored: true,
  paranoid: true,
  tableName: 'objects'
});

Object.hasMany(ObjectAttribute, {
  as: 'attributes',
  foreignKey: 'object_id',
});

Object.withAttributes = {
  model: ObjectAttribute,
  as: 'attributes',
  attributes: ['value'],
  include: [Attribute],
  // through: { attributes: ['value'], as: 'objectAttribute' },
};

module.exports = Object;
