const { DataTypes } = require('sequelize');
const { sequelize } = require('./../config/config');
const Doctor = require('./Doctor.model');
const User = require('./User.model'); 

const Review = sequelize.define('REVIEW', {
  review_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Doctor,
      key: 'doctor_id'
    },
    allowNull: false
  },
  patient_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'user_id'
    },
    allowNull: false
  }
}, {
  timestamps: false
});

// Associations
Review.belongsTo(Doctor, { foreignKey: 'doctor_id' });
Doctor.hasMany(Review, { foreignKey: 'doctor_id' });

Review.belongsTo(User, { foreignKey: 'patient_id' });
User.hasMany(Review, { foreignKey: 'patient_id' });

module.exports = Review;
