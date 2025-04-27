const specialtyService = require('../service/Specialty.service');

// Controller to create a new specialty
const createSpecialty = async (req, res) => {
  try {
    const { name } = req.body;
    const specialty = await specialtyService.createSpecialty(name);
    res.status(201).json({ specialty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get all specialties
const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await specialtyService.getAllSpecialties();
    res.status(200).json({ specialties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get a specialty by ID
const getSpecialtyById = async (req, res) => {
  try {
    const { id } = req.params;
    const specialty = await specialtyService.getSpecialtyById(id);
    res.status(200).json({ specialty });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Controller to update a specialty
const updateSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedSpecialty = await specialtyService.updateSpecialty(id, name);
    res.status(200).json({ updatedSpecialty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to delete a specialty
const deleteSpecialty = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSpecialty = await specialtyService.deleteSpecialty(id);
    res.status(200).json({ deletedSpecialty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSpecialty,
  getAllSpecialties,
  getSpecialtyById,
  updateSpecialty,
  deleteSpecialty,
};
