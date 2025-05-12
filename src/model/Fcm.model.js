const { DataTypes } = require('sequelize');
const { sequelize } = require('./../config/config');
const User = require('./User.model');

const FCM = sequelize.define('FCM', {
  fcm_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
   token: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
}, {
  timestamps: false,

});

FCM.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(FCM, { foreignKey: 'user_id' });

module.exports = FCM;
