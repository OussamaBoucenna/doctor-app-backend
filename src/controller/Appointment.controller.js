// controllers/appointment.controller.js
const appointmentService = require('../service/Appointment.service');
const Appointment = require('../model/Appointment.model');
const AppointmentSlot = require('../model/AppointmentSlot.model');
const DoctorSchedule = require('./../model/DoctorSchedule.model');
const Patient = require('../model/Patient.model');
const User = require('../model/User.model');
const { Op } = require('sequelize');

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


const getNextAppointment = async (req, res) => {
  try {
    const  doctorId = req.doctorId;
    
    // Vérifier si le docteur existe
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'L\'identifiant du médecin est requis'
      });
    }
    
   

    
    const currentDate = new Date();
    
  
    
    
    const nextAppointment = await Appointment.findOne({
      include: [
        {
          model: AppointmentSlot,
          // as: appointmentSlotAlias,
          where: {
            // Vérifier que la date et l'heure sont dans le futur
            [Op.or]: [
              {
                working_date: {
                  [Op.gt]: currentDate.toISOString().split('T')[0] // Date actuelle
                }
              },
              {
                working_date: currentDate.toISOString().split('T')[0],
                start_time: {
                  [Op.gt]: currentDate.toTimeString().split(' ')[0] // Heure actuelle
                }
              }
            ]
          },
          include: [
            {
              model: DoctorSchedule,
              where: { doctor_id: doctorId }
            }
          ]
        },
        {
          model: Patient,
          // as: patientAlias,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['first_name', 'last_name', 'email', 'phone']
            }
          ]
        }
      ],
      where: {
        status: {
          [Op.in]: ['PENDING', 'CONFIRMED']
        }
      },
      order: [
        [AppointmentSlot, 'working_date', 'ASC'],
        [ AppointmentSlot,'start_time', 'ASC']
      ],
      limit: 1,
    });

    if (!nextAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Aucun rendez-vous à venir pour ce médecin'
      });
    }
    const count = await appointmentService.countAppointmentsForPatientAndDoctor(nextAppointment.patient_id, doctorId);
    return res.status(200).json({
      success: true,
      message: 'Prochain rendez-vous récupéré avec succès',
      nextAppointment: {
        appointement_id : nextAppointment.appointment_id,
        patient_id: nextAppointment.patient_id,
        status: nextAppointment.status,  
        fullname : `${nextAppointment.PATIENT.user.first_name} ${nextAppointment.PATIENT.user.last_name}`,
        start_time: nextAppointment.APPOINTMENT_SLOT.start_time,
        reason : nextAppointment.reason,
        numberOfVisit : count
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du prochain rendez-vous:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du prochain rendez-vous',
      error: error.message
    });
  }
};



module.exports = {
  getNextAppointment,
  create,
  getAll,
  getAppointmentsByPatientId,
  getAppointment,
  update,
  remove
};
