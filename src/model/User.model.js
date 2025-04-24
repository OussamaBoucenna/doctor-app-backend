const { DataTypes } = require('sequelize');
const { sequelize } = require('./../config/config');

const User = sequelize.define('USER', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role: DataTypes.ENUM('admin', 'doctor', 'patient'),
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  image: {
    type: DataTypes.BLOB('long'), // ou DataTypes.TEXT si tu stockes base64
    allowNull: true
  }
}, {
  timestamps: false
});

module.exports = User;