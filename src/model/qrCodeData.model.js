// qrCodeData.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/config');

const QRCodeData = sequelize.define('QRCodeData', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.BIGINT,  // Utilisation de BIGINT pour stocker un timestamp long
    allowNull: false
  }
}, {
  timestamps: false,

});

module.exports = QRCodeData;
