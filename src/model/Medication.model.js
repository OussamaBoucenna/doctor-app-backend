// models/Medication.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config');
const Prescription = require('./Prescription.model');

const Medication = sequelize.define('MEDICATION', {
  medication_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dosage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prescription_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,

});




module.exports = Medication;
