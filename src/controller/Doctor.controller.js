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

    // Respond with success message after successful deletion
    res.status(200).json(result); // Changed from 204 to 200 with message
  } catch (error) {
    // Handle any internal server errors
    console.error('Error deleting doctor:', error);
    res.status(400).json({ message: 'Error deleting doctor', error: error.message });
  }
};

const getAppointmentsByDate = async (req, res) => {
  try {
    // Change from doctorId to id to match the route parameter
    const doctorId = req.params.id; // This matches the :id in your route
    const date = req.params.date;   // This matches the :date in your route

    // Debug logging
    console.log('Route params:', req.params);
    console.log('Doctor ID:', doctorId);
    console.log('Date:', date);

    // Validate input parameters
    if (!doctorId || !date) {
      return res.status(400).json({ 
        message: 'Both doctorId and date are required parameters',
        received: { doctorId, date }
      });
    }

    // Validate date format (assuming YYYY-MM-DD format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Please use YYYY-MM-DD format' 
      });
    }

    // Call the service method to fetch appointments for the doctor
    const appointments = await DoctorService.getAppointmentsByDate(doctorId, date);

    // Return the list of appointments (can be empty array if no appointments found)
    res.status(200).json({
      message: 'Appointments retrieved successfully',
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    // Log and handle any errors
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      message: 'Error fetching appointments', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getAppointmentsByDate
};