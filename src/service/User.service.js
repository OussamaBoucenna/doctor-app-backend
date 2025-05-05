const Patient = require('../model/Patient.model');
const  User  = require('./../model/User.model');

const getUserById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }
  return user;
};

const getUserPatienById = async (id) => {
  const user = await User.findByPk(id, {
    include: [
      {
        model: Patient,
        attributes: { exclude: [] },
      },
    ],
  });
  
  
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }
  return user;
};

module.exports = {
  getUserById,
  getUserPatienById
};