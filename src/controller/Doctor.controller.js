const DoctorService = require('../service/Doctor.service');

async function getAllDoctors(req, res) {
  try {
    // Call the service method to get all doctors
    const doctors = await DoctorService.getAllDoctors();

    // Check if doctors data is empty
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors found' });
    }

    // Respond with the doctors' information in JSON format
    res.status(200).json(doctors);
    console.log('Doctors:', doctors);
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error fetching doctors:', error);

    // Send an error response with appropriate status code and message
    res.status(500).json({
      message: 'Error fetching doctors',
      error: error.message || error,
    });
  }
}

const getDoctorById = async (req, res) => {
  try {
    // Fetch the doctor by ID
    const doctor = await DoctorService.getDoctorById(req.params.id);

    // If the doctor is not found, return a 404
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Respond with the doctor information
    res.status(200).json(doctor);
  } catch (error) {
    // Handle any internal server errors
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Error fetching doctor details', error: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    // Fetch and update the doctor data
    const doctor = await DoctorService.updateDoctor(req.params.id, req.body);

    // If the doctor is not found, return a 404
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found to update' });
    }

    // Respond with the updated doctor data
    res.status(200).json({ message: 'Doctor updated successfully', doctor });
  } catch (error) {
    // Handle validation or other errors
    console.error('Error updating doctor:', error);
    res.status(400).json({ message: 'Error updating doctor', error: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    // Call the service method to delete the doctor
    const result = await DoctorService.deleteDoctor(req.params.id);

    // If the doctor was not found, return a 404
    if (!result) {
      return res.status(404).json({ message: 'Doctor not found to delete' });
    }

    // Respond with no content after successful deletion
    res.status(204).send();
  } catch (error) {
    // Handle any internal server errors
    console.error('Error deleting doctor:', error);
    res.status(400).json({ message: 'Error deleting doctor', error: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
};
