const { sequelize, Sequelize } = require('../../../config/sequelize');
const Class = require('../character/Class');
const Object = require('./Object');

const ObjectClasses = sequelize.define('ObjectClasses', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  class_id: {
    type: Sequelize.INTEGER,
    foreignKey: true,
    references: {
      model: Class,
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
    type: Sequelize.STRING,
    allowNull: false,
  },
}, { underscored: true, paranoid: true, tableName: 'object_classes' });

module.exports = ObjectClasses;
