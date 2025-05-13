const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config');
const AppointmentSlot = require('./AppointmentSlot.model');
const Patient = require('./Patient.model');
const QRCodeData = require('./qrCodeData.model');  // Importation du modèle QRCodeData

const Appointment = sequelize.define('APPOINTEMENTS', {
  appointment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slot_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: AppointmentSlot,
      key: 'slot_id'
    }
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Patient,
      key: 'patient_id'
    }
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  qr_data: {
    type: DataTypes.JSON,
    allowNull: true  // Le champ `qr_data` est de type JSON
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_book: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: false
});

// Associations
Appointment.belongsTo(AppointmentSlot, { foreignKey: 'slot_id' });
AppointmentSlot.hasMany(Appointment, { foreignKey: 'slot_id' });

Appointment.belongsTo(Patient, { foreignKey: 'patient_id' });
Patient.hasMany(Appointment, { foreignKey: 'patient_id' });

module.exports = Appointment;
