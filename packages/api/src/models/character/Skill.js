const { sequelize, Sequelize } = require('../../../config/sequelize');

const Skill = sequelize.define('Skill', {
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

module.exports = Skill;
