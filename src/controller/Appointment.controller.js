// controllers/appointment.controller.js
const appointmentService = require('../service/Appointment.service');

const create = async (req, res) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.getAppointmentById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error in getAppointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAppointmentsByPatientId = async (req, res) => {

  const userId = req.user.userId; 
  console.log('User ID:', userId); // Debugging
  try {
    const appointments = await appointmentService.getAppointmentsByPatientId(userId);
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error getting appointments by patient ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const updated = await appointmentService.updateAppointment(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await appointmentService.deleteAppointment(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  create,
  getAll,
  getAppointmentsByPatientId,
  getAppointment,
  update,
  remove
};
