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

const updateUserPatientById = async (id, userData = {}, patientData = {}) => {
  return await sequelize.transaction(async (t) => {
    // 1. USER
    const user = await User.findByPk(id, { transaction: t });
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    await user.update(userData, { transaction: t });

    // 2. PATIENT relié
    let patient = await Patient.findOne({
      where: { user_id: id },
      transaction: t,
    });
    if (!patient) {
      // Si tu souhaites créer le patient automatiquement :
      patient = await Patient.create(
        { user_id: id, ...patientData },
        { transaction: t }
      );
    } else {
      await patient.update(patientData, { transaction: t });
    }

    // 3. Retourne l’objet combiné mis à jour
    return await User.findByPk(id, {
      include: [{ model: Patient }],
      transaction: t,
    });
  });
};

module.exports = {
  updateUserPatientById,
  getUserById,
  getUserPatienById
};