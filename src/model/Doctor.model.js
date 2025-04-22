const { DataTypes } = require('sequelize');
const { sequelize } = require('./../config/config');
const User = require('./User.model');

const Doctor = sequelize.define('DOCTOR', {
  doctor_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  adresse: DataTypes.STRING,
  clinique_name: DataTypes.STRING,
  location: DataTypes.JSON,
  photo: DataTypes.STRING,
  speciality: DataTypes.ENUM('general', 'dentist', 'dermatologist'),
  facebook_link: DataTypes.STRING,
  instagram_link: DataTypes.STRING,
  tiktok_link: DataTypes.STRING
}, {
  timestamps: false
});

Doctor.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Doctor, { foreignKey: 'user_id' });

module.exports = Doctor;
