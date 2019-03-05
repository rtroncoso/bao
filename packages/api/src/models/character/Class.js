const { sequelize, Sequelize } = require('../../../config/sequelize');

const Class = sequelize.define('Class', {
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
      msg: 'Class name already exists',
    },
  },
}, { underscored: true, paranoid: true });

module.exports = Class;
