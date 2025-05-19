const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config');
const Doctor = require('./Doctor.model');

const DoctorSchedule = sequelize.define('DOCTOR_SCHEDULES', {
  schedule_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Doctor,
      key: 'doctor_id'
    }
  },
  working_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  appointment_duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});

// Associations
DoctorSchedule.belongsTo(Doctor, { foreignKey: 'doctor_id' });
Doctor.hasMany(DoctorSchedule, { foreignKey: 'doctor_id' });

module.exports = DoctorSchedule;
