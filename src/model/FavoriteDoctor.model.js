const { DataTypes } = require('sequelize');
const { sequelize } = require('./../config/config');

const FavoriteDoctor = sequelize.define('FAVORITE_DOCTOR', {
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});

module.exports = FavoriteDoctor;