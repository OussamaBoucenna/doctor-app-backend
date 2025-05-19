const { DataTypes } = require('sequelize');
const { sequelize } = require('./../config/config');
const Doctor = require('./Doctor.model');
const Patient = require('./Patient.model');

const FavoriteDoctor = sequelize.define('FAVORITE_DOCTOR', {
  favorite_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'PATIENT',
      key: 'patient_id'
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'DOCTOR',
      key: 'doctor_id'
    }
  }
}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['patient_id', 'doctor_id']
    }
  ]
});

// Add associations
FavoriteDoctor.belongsTo(Doctor, { foreignKey: 'doctor_id' });
FavoriteDoctor.belongsTo(Patient, { foreignKey: 'patient_id' });

module.exports = FavoriteDoctor;