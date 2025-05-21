// controllers/appointment.controller.js
const appointmentService = require('../service/Appointment.service'); 
const Appointment = require('../model/Appointment.model');
const AppointmentSlot = require('../model/AppointmentSlot.model');
const DoctorSchedule = require('../model/DoctorSchedule.model');
const Patient = require('../model/Patient.model');
const User = require('../model/User.model');
const { Op } = require('sequelize');

const create = async (req, res) => {
  const userId = req.user.userId;
  try {
    const appointment = await appointmentService.createAppointment(req.body,userId);
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

const getAppointmentDetails = async (req, res) => {
  const { appointmentId } = req.params; // Extract appointmentId from route params

  try {
    const appointmentDetails = await appointmentService.getAppointmentDetailsById(appointmentId);
    if (!appointmentDetails) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json(appointmentDetails);
  } catch (error) {
    // Handle errors, return an error message
    console.error(error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
};


const getAppointmentsByPatientId = async (req, res) => {

  const userId = req.user.userId; 
  console.log('User ID:', userId); // Debugging
  try {
    const appointments = await appointmentService.getAppointmentsByPatientId(userId);
    console.log('Appointments:', appointments); // Debugging
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error getting appointments by patient ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getFirstUpcomingAppointmentByPatientId = async (req, res) => {
  const userId = req.user.userId;
  console.log('User ID:', userId);
  try {
    const appointment = await appointmentService.getFirstUpcomingAppointmentByPatientId(userId);
    if (!appointment) {
      return res.status(404).json({ message: 'No upcoming appointments found' });
    }
    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error getting first upcoming appointment:', error);
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


const cancelAppointment = async (req, res) => {
  const { appointment_id } = req.params;

  try {
    const formattedAppointment = await appointmentService.cancelAppointment(appointment_id);

    return res.status(200).json(formattedAppointment);

  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    if (error.message === 'ALREADY_CANCELLED') {
      return res.status(400).json({ message: 'Appointment already cancelled.' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


const confirmAppointment = async (req, res) => {
  const { appointment_id } = req.params;

  try {
    const formattedAppointment = await appointmentService.confirmAppointment(appointment_id);

    return res.status(200).json(formattedAppointment);

  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    if (error.message === 'ALREADY_CANCELLED') {
      return res.status(400).json({ message: 'Appointment already confirmed.' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
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
    //console.log('Nombre de visites pour le patient et le médecin:', nextAppointment.PATIENT);
    return res.status(200).json({
      success: true,
      message: 'Prochain rendez-vous récupéré avec succès',
      nextAppointment: {
        appointement_id : nextAppointment.appointment_id,
        patient_id: nextAppointment.patient_id,
        status: nextAppointment.status,  
        fullname : `${nextAppointment.PATIENT.USER.first_name} ${nextAppointment.PATIENT.USER.last_name}`,
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

const getTodaysAppointments = async (req, res) => {
  try {
    const doctorId = req.doctorId;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'L\'identifiant du médecin est requis' });
    }

    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]; // format: 'YYYY-MM-DD'

    const todaysAppointments = await Appointment.findAll({
      include: [
        {
          model: AppointmentSlot,
          where: {
            working_date: todayDate
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
          include: [
            {
              model: User,
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
        [AppointmentSlot, 'start_time', 'ASC']
      ]
    });

    if (!todaysAppointments || todaysAppointments.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucun rendez-vous pour aujourd\'hui' });
    }

    const formatted = await Promise.all(todaysAppointments.map(async (appointment) => {
      const count = await appointmentService.countAppointmentsForPatientAndDoctor(appointment.patient_id, doctorId);
      return {
        appointment_id: appointment.appointment_id,
        patient_id: appointment.patient_id,
        status: appointment.status,
        fullname: `${appointment.PATIENT.USER.first_name} ${appointment.PATIENT.USER.last_name}`,
        start_time: appointment.APPOINTMENT_SLOT.start_time,
        reason: appointment.reason,
        numberOfVisit: count
      };
    }));

    return res.status(200).json({
      success: true,
      message: 'Rendez-vous du jour récupérés avec succès',
      appointments: formatted
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous du jour:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};


const getAppointmentsOfDayByDoctorId = async (req, res) => {
  const doctorId = req.doctorId;
  const {date} =req.body ; 
  //console.log('Date ID:', date); // Debugging

  try {
    const appointments = await appointmentService.getPendingAppointmentsByDoctorAndDay(doctorId,date);
  // console.log(appointments)

  //  console.log('----------------------------------------')
  //  console.log('----------------------------------------')

  //  console.log('----------------------------------------')

  //  console.log('Appointments:', appointments);
  //  console.log('----------------------------------------')

  //  console.log('----------------------------------------')
  //  console.log('----------------------------------------')

    return res.status(200).json({
      success: true,
      message: 'Rendez-vous du jour récupérés avec succès',
      nextAppointments: appointments
    });
  } catch (error) {
    console.error('Error getting appointments of the day:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};


const getAppointmentsConfirmdOfDayByDoctorId = async (req, res) => {
  const doctorId = req.doctorId;
  const date = req.params.date;   // This matches the :date in your route

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
  try {
    const appointments = await appointmentService.getConfirmedAppointmentsByDoctorAndDay(doctorId,date);
   console.log(appointments)

    return res.status(200).json({
      message: 'Appointments retrieved successfully',
      data: appointments,
      count: appointments.length
    });
  } catch (error) {
    console.error('Error getting appointments of the day:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};


module.exports = {
  getAppointmentsOfDayByDoctorId,
  getAppointmentsConfirmdOfDayByDoctorId,
  getTodaysAppointments,
  getNextAppointment,
  create,
  getAll,
  getAppointmentsByPatientId,
  getFirstUpcomingAppointmentByPatientId,
  getAppointment,
  update,
  remove,
  getAppointmentDetails,
  cancelAppointment,
  confirmAppointment
};


