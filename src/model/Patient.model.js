const { DataTypes } = require('sequelize');
const { sequelize } = require('./../config/config');
const User = require('./User.model');

const Patient = sequelize.define('PATIENT', {
  patient_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date_birthday: DataTypes.DATE,
  sexe: DataTypes.ENUM('male', 'female')
}, {
  timestamps: false
});

Patient.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Patient, { foreignKey: 'user_id' });

module.exports = Patient;