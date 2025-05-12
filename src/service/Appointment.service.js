// services/appointment.service.js
// services/appointment.service.js
const { Op } = require('sequelize');
const AppointmentSlot = require('../model/AppointmentSlot.model');
const DoctorSchedule = require('../model/DoctorSchedule.model');
const Appointment = require('../model/Appointment.model');
const Doctor = require('../model/Doctor.model');
const Patient = require('../model/Patient.model');
const User = require('../model/User.model');

const createAppointment = async (data) => {
  try {
    const appointment = await Appointment.create(data);
    return appointment;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

const getAllAppointments = async () => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: AppointmentSlot,
          include: [
            {
              model: DoctorSchedule,
              attributes: { exclude: [] } 
            }
          ],
          attributes: { exclude: [] }
        },
        {
          model: Patient,
          attributes: { exclude: [] }
        },
      
      ],
      attributes: { exclude: [] },
      raw: true, // flatten the result
      nest: false // ensure no nested objects
    });

    return appointments;
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    throw error;
  }
};


const getAppointmentById = async (id) => {
  try {
    const appointment = await Appointment.findOne({
      where: { appointment_id: id },
      include: [
        {
          model: AppointmentSlot,
          include: [
            {
              model: DoctorSchedule,
              attributes: ['doctor_id', 'working_date', 'start_time']
            }
          ],
          attributes: ['working_date', 'start_time']
        },
        {
          model: Patient,
          attributes: ['patient_id']
        }
      ]
    });

    if (!appointment) return null;
    return {
      id: appointment.appointment_id.toString(),
      doctorId: appointment.APPOINTMENT_SLOT?.DOCTOR_SCHEDULE?.doctor_id?.toString(),
      patientId: appointment.patient_id.toString(),
      date: appointment.APPOINTMENT_SLOT?.working_date,
      time: appointment.APPOINTMENT_SLOT?.start_time,
      status: appointment.status,
      reason: appointment.reason
    };
  } catch (error) {
    //console.error('Error fetching appointment by ID:', error);
    throw error;
  }
};

const getAppointmentsByPatientId = async (userId) => {
  console.log('Fetching appointments for user ID:', userId);
  
  try {
    // Trouver le patient correspondant à userId
    const patient = await Patient.findOne({
      where: { user_id: userId },
      include: [User],
    });

    if (!patient) {
      return [];
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    // Récupérer tous les rendez-vous liés à ce patient
    const appointments = await Appointment.findAll({
      where: { patient_id: patient.patient_id },
      include: [
        {
          model: AppointmentSlot,
          where: {
            [Op.or]: [
              { working_date: { [Op.gt]: today } },
              {
                working_date: today,
                start_time: { [Op.gt]: currentTime }
              }
            ]
          },
          include: [
            {
              model: DoctorSchedule,
              attributes: ['doctor_id', 'working_date', 'start_time']
            }
          ],
          attributes: ['working_date', 'start_time']
        },
      ]
    });

    // Transformer les données pour chaque rendez-vous
    return appointments.map((appointment) => ({
      id: appointment.appointment_id.toString(),
      "APPOINTMENT_SLOT.DOCTOR_SCHEDULE.doctor_id": appointment.APPOINTMENT_SLOT?.DOCTOR_SCHEDULE?.doctor_id?.toString(),
      patientId: appointment.patient_id.toString(),
      "APPOINTMENT_SLOT.working_date": appointment.APPOINTMENT_SLOT?.working_date,
      "APPOINTMENT_SLOT.start_time": appointment.APPOINTMENT_SLOT?.start_time,
      status: appointment.status,
      reason: appointment.reason
    }));
    
  } catch (error) {
    console.error('Error fetching appointments by patient ID:', error);
    throw error;
  }
};

const getFirstUpcomingAppointmentByPatientId = async (userId) => {
  try {
    // Step 1: Find the patient from the user ID
    const patient = await Patient.findOne({
      where: { user_id: userId },
      include: [User],
    });

    if (!patient) {
      return null;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];

    // Step 2: Fetch the first upcoming appointment
    const appointment = await Appointment.findOne({
      where: { patient_id: patient.patient_id },
      include: [
        {
          model: AppointmentSlot,
          where: {
            [Op.or]: [
              { working_date: { [Op.gt]: today } },
              {
                working_date: today,
                start_time: { [Op.gt]: currentTime }
              }
            ]
          },
          include: [
            {
              model: DoctorSchedule,
              attributes: ['doctor_id', 'working_date', 'start_time']
            }
          ],
          attributes: ['working_date', 'start_time']
        }
      ],
      order: [[AppointmentSlot, 'working_date', 'ASC'], [AppointmentSlot, 'start_time', 'ASC']],
    });

    if (!appointment) {
      return null;
    }

    return {
      id: appointment.appointment_id.toString(),
      "APPOINTMENT_SLOT.DOCTOR_SCHEDULE.doctor_id": appointment.APPOINTMENT_SLOT?.DOCTOR_SCHEDULE?.doctor_id?.toString(),
      patientId: appointment.patient_id.toString(),
      "APPOINTMENT_SLOT.working_date": appointment.APPOINTMENT_SLOT?.working_date,
      "APPOINTMENT_SLOT.start_time": appointment.APPOINTMENT_SLOT?.start_time,
      status: appointment.status,
      reason: appointment.reason
    };
  } catch (error) {
    console.error('Error fetching first upcoming appointment by patient ID:', error);
    throw error;
  }
};


const updateAppointment = async (id, updates) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) return null;
  return await appointment.update(updates);
};

const deleteAppointment = async (id) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) return null;
  await appointment.destroy();
  return appointment;
};




const  countAppointmentsForPatientAndDoctor = async (patientId, doctorId) => {
  try {
    const count = await Appointment.count({
      where: {
        patient_id: patientId
      },
      include: [
        {
          model: AppointmentSlot,
          include: [
            {
              model: DoctorSchedule,
              where: {
                doctor_id: doctorId
              }
            }
          ]
        }
      ]
    });

    return count;
  } catch (error) {
    console.error("Erreur lors du comptage des rendez-vous :", error);
    throw error;
  }
}




module.exports = {
  countAppointmentsForPatientAndDoctor,

  
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByPatientId,
  getFirstUpcomingAppointmentByPatientId,
  updateAppointment,
  deleteAppointment,
};
