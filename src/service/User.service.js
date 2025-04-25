const  User  = require('./../model/User.model');

const getUserById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }
  return user;
};

module.exports = {
  getUserById,
};