const Specialty = require('../model/Specialty.model'); // Import the Specialty model

// Service to create a new specialty
const createSpecialty = async (name) => {
  try {
    const specialty = await Specialty.create({ name });
    return specialty;
  } catch (error) {
    throw new Error('Error creating specialty: ' + error.message);
  }
};

// Service to get all specialties
const getAllSpecialties = async () => {
  try {
    const specialties = await Specialty.findAll();
    return specialties;
  } catch (error) {
    throw new Error('Error fetching specialties: ' + error.message);
  }
};

// Service to get a specialty by ID
const getSpecialtyById = async (specialtyId) => {
  try {
    const specialty = await Specialty.findByPk(specialtyId);
    if (!specialty) throw new Error('Specialty not found');
    return specialty;
  } catch (error) {
    throw new Error('Error fetching specialty: ' + error.message);
  }
};

// Service to update a specialty by ID
const updateSpecialty = async (specialtyId, name) => {
  try {
    const specialty = await Specialty.findByPk(specialtyId);
    if (!specialty) throw new Error('Specialty not found');
    specialty.name = name;
    await specialty.save();
    return specialty;
  } catch (error) {
    throw new Error('Error updating specialty: ' + error.message);
  }
};

// Service to delete a specialty by ID
const deleteSpecialty = async (specialtyId) => {
  try {
    const specialty = await Specialty.findByPk(specialtyId);
    if (!specialty) throw new Error('Specialty not found');
    await specialty.destroy();
    return specialty;
  } catch (error) {
    throw new Error('Error deleting specialty: ' + error.message);
  }
};

module.exports = {
  createSpecialty,
  getAllSpecialties,
  getSpecialtyById,
  updateSpecialty,
  deleteSpecialty,
};
