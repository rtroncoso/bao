const { sequelize, Sequelize } = require('../../../config/sequelize');

const Attribute = sequelize.define('Attribute', {
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
      msg: 'Attribute name already exists',
    },
  },
}, { underscored: true, paranoid: true });

module.exports = Attribute;
