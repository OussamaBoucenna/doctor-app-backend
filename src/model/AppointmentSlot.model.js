const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config');
const DoctorSchedule = require('../model/DoctorSchedule.model');

const AppointmentSlot = sequelize.define('APPOINTMENT_SLOTS', {
  slot_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DoctorSchedule,
      key: 'schedule_id'
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
  is_book: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: false
});

// Associations
AppointmentSlot.belongsTo(DoctorSchedule, { foreignKey: 'schedule_id' });
DoctorSchedule.hasMany(AppointmentSlot, { foreignKey: 'schedule_id' });

module.exports = AppointmentSlot;
