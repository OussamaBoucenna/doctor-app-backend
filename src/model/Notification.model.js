const { DataTypes } = require('sequelize');
const { sequelize } = require('./../config/config');
const User = require('./User.model');

const Notification = sequelize.define('NOTIFICATION', {
  notification_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: DataTypes.STRING,
  message: DataTypes.STRING,
  is_read: DataTypes.BOOLEAN
}, {
  timestamps: true,

});

Notification.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Notification, { foreignKey: 'user_id' });

module.exports = Notification;
