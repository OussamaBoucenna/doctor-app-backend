const { DataTypes } = require('sequelize');
const { sequelize } = require('./../config/config');
const User = require('./User.model');
const Specialty = require('./Specialty.model'); // Assuming you have a Specialty model

const Doctor = sequelize.define('DOCTOR', {
  doctor_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true
  },
  clinique_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  facebook_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instagram_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tiktok_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  patiens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    allowNull: true
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true
  },
  yearsExperience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true
  },
  specialty_id: { // Add specialty_id field
    type: DataTypes.INTEGER,
    references: {
      model: Specialty, // Reference to the Specialty model
      key: 'specialty_id'
    },
    allowNull: true
  }
}, {
  timestamps: false
});

// Set up the relationships
Doctor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctor' });


Doctor.belongsTo(Specialty, { foreignKey: 'specialty_id' }); // Associate Doctor with Specialty
Specialty.hasMany(Doctor, { foreignKey: 'specialty_id' }); // One specialty can have many doctors

module.exports = Doctor;
