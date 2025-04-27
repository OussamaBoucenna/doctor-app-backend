const { DataTypes } = require('sequelize');
const { sequelize } = require('./../config/config');

const Specialty = sequelize.define('SPECIALTY', {
    specialty_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
  }, {
    timestamps: false,
    tableName: 'SPECIALTY',  // Explicitly specify the table name
  });
  
  module.exports = Specialty;
  