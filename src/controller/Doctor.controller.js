const DoctorService = require('../service/Doctor.service');


async function getAllDoctors(req, res) {
  try {
    const doctors = await doctorService.getAllDoctors();
    res.status(200).json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des docteurs' });
  }
}

const getDoctorById = async (req, res) => {
  try {
    const doctor = await DoctorService.getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await DoctorService.updateDoctor(req.params.id, req.body);
    res.status(200).json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    await DoctorService.deleteDoctor(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
};
