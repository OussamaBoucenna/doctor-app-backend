// models/Medication.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config');

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
  timestamps: false
});

// Définir les relations pour Prescription
// Nous utilisons les IDs des tables Doctor et Patient, pas directement des Users
Prescription.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'Doctor' });
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'Patient' });
Prescription.hasMany(Medication, { foreignKey: 'prescription_id' });
Medication.belongsTo(Prescription, { foreignKey: 'prescription_id' });
