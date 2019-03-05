const { sequelize, Sequelize } = require('../../../config/sequelize');

const ObjectType = sequelize.define('ObjectType', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'ObjectType name already exists',
    },
  },
}, { underscored: true, paranoid: true, tableName: 'object_types' });

module.exports = ObjectType;
