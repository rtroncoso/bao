const { sequelize, Sequelize } = require('../../../config/sequelize');

const Race = sequelize.define('Race', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, { underscored: true, paranoid: true });

module.exports = Race;
