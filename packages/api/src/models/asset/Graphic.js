const { sequelize, Sequelize } = require('../../../config/sequelize');

const Graphic = sequelize.define('Graphic', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
}, { underscored: true, paranoid: true });

module.exports = Graphic;
