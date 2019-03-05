const { sequelize, Sequelize } = require('../../../config/sequelize');
const Object = require('./Object');
const Attribute = require('./Attribute');

const ObjectAttribute = sequelize.define('ObjectAttribute', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  attribute_id: {
    type: Sequelize.INTEGER,
    foreignKey: true,
    references: {
      model: Attribute,
      key: 'id',
    },
  },
  object_id: {
    type: Sequelize.INTEGER,
    foreignKey: true,
    references: {
      model: Object,
      key: 'id',
    },
  },
  value: {
    type: Sequelize.STRING(512),
    allowNull: false,
  },
}, {
  underscored: true,
  timestamps: false,
  tableName: 'object_attributes',
});

module.exports = ObjectAttribute;
