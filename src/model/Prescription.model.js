// models/Prescription.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config');
const User = require('./User.model');
const Doctor = require('./Doctor.model');
const Patient = require('./Patient.model');
const Medication = require('./Medication.model');

const Prescription = sequelize.define('PRESCRIPTION', {
  prescription_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: false
});

// Définir les relations pour Prescription
// Nous utilisons les IDs des tables Doctor et Patient, pas directement des Users
Prescription.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'Doctor' });
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'Patient' });
Prescription.hasMany(Medication, { foreignKey: 'prescription_id' });
Medication.belongsTo(Prescription, { foreignKey: 'prescription_id' });

// Relation dans l'autre sens
Doctor.hasMany(Prescription, { foreignKey: 'doctor_id', as: 'Prescriptions' });
Patient.hasMany(Prescription, { foreignKey: 'patient_id', as: 'Prescriptions' });

module.exports = Prescription;
