// services/appointment.service.js
// services/appointment.service.js
const { Op } = require('sequelize');
const AppointmentSlot = require('../model/AppointmentSlot.model');
const DoctorSchedule = require('../model/DoctorSchedule.model');
const Appointment = require('../model/Appointment.model');
const Doctor = require('../model/Doctor.model');
const Patient = require('../model/Patient.model');
const User = require('../model/User.model');
const Specialty = require('../model/Specialty.model');
const calculateAge = require('../utils/calculateAge'); // Assuming you have a utility function to calculate age

const createAppointment = async (data, userId) => {
  const t = await Appointment.sequelize.transaction();

  try {
    // Step 1: Find the patient by userId
    const patient = await Patient.findOne({
      where: { user_id: userId },
    });

    if (!patient) {
      return {
        success: false,
        message: 'Patient not found for the given userId.',
        appointment: null,
      };
    }

    // Step 2: Add patient_id to data
    const appointmentData = {
      ...data,
      patient_id: patient.patient_id,
    };

    // Step 3: Create the appointment
    const appointment = await Appointment.create(appointmentData, { transaction: t });

    // Step 4: Mark the slot as booked
    await AppointmentSlot.update(
      { is_book: true },
      { where: { slot_id: data.slot_id }, transaction: t }
    );

    await t.commit();

    return {
      success: true,
      message: 'Appointment booked successfully.',
      appointment,
    };
  } catch (error) {
    await t.rollback();
    console.error('Error creating appointment:', error);
    return {
      success: false,
      message: error.message || 'Unknown error occurred while booking appointment.',
      appointment: null,
    };
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

const getAppointmentDetailsById = async (appointmentId) => {
  try {
    const appointment = await Appointment.findOne({
      where: { appointment_id: appointmentId },
      include: [
        {
          model: AppointmentSlot,
          include: [
            {
              model: DoctorSchedule,
              include: [
                {
                  model: Doctor,
                  include: [
                    {
                      model:  Specialty, // Join with Specialty for specialty details
                      attributes: ['specialty_id', 'name']
                    },
                    {
                      model: User, // Join with User for doctor details (name, imageUrl)
                      attributes: ['first_name', 'last_name', 'image']
                    }
                  ],
                  attributes: ['doctor_id', 'clinique_name', 'rating', 'reviewCount']
                }
              ]
            }
          ]
        },
        {
          model: Patient,
          include: [
            {
              model: User, // Join with User for patient full_name
              attributes: ['first_name','last_name']
            }
          ],
          attributes: ['patient_id', 'date_birthday','sexe']
        }
      ]
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const slot = appointment.APPOINTMENT_SLOT;
    const schedule = slot?.DOCTOR_SCHEDULE;
    const doctor = schedule?.DOCTOR;
    const specialty = doctor?.SPECIALTY;
    const doctorUser = doctor?.USER; // Doctor's user data (name, imageUrl)
    const patient = appointment.PATIENT;
    const patientUser = patient?.USER; // Patient's user data (full_name, gender, etc.)

    return {
      doctor: {
        id: doctor?.doctor_id?.toString(),
        name: `${doctorUser?.first_name} ${doctorUser?.last_name}`,
        specialty: {
          id: specialty?.specialty_id?.toString(),
          name: specialty?.name
        },
        hospital: doctor?.clinique_name,
        rating: parseFloat(doctor?.rating || 0),
        reviewCount: parseInt(doctor?.reviewCount || 0),
        imageResId: doctorUser?.image || null
      },
      appointment: {
        id: appointment.appointment_id.toString(),
        patientId: patient?.patient_id?.toString(),
        doctorId: doctor?.doctor_id?.toString(),
        date: slot?.working_date,
        time: slot?.start_time,
        status: appointment.status,
        reason: appointment.reason
      },
      patient: {
        id: patient?.patient_id?.toString(),
        fullName: `${patientUser?.first_name} ${patientUser?.last_name}`,
        gender: patientUser?.sexe,
        age: calculateAge(patientUser?.birth_date),
        problemDescription: appointment.reason
      }
    };
  } catch (error) {
    throw error;
  }
}

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

const cancelAppointment = async (appointmentId) => {
  const appointment = await Appointment.findByPk(appointmentId, {
    include: {
      model: AppointmentSlot,
      as: 'APPOINTMENT_SLOT',
      include: {
        association: 'DOCTOR_SCHEDULE', // assure-toi que cette association est bien définie dans le modèle
      }
    }
  });

  if (!appointment) throw new Error('NOT_FOUND');
  if (appointment.status === 'CANCELLED') throw new Error('ALREADY_CANCELLED');

  appointment.status = 'CANCELLED';
  appointment.is_book = false;
  await appointment.save();

  await AppointmentSlot.update(
    { is_book: false },
    { where: { slot_id: appointment.slot_id } }
  );

  // Formaté comme demandé
  return {
    success: true,
    message: "Appointment cancelled and slot released.",
    appointment: {
      id: appointment.appointment_id.toString(),
      doctorId: appointment.APPOINTMENT_SLOT?.DOCTOR_SCHEDULE?.doctor_id?.toString(),
      patientId: appointment.patient_id.toString(),
      workingDate: appointment.APPOINTMENT_SLOT?.working_date,
      startTime: appointment.APPOINTMENT_SLOT?.start_time,
      status: appointment.status,
      reason: appointment.reason
    }
  };
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
  getAppointmentDetailsById,
  cancelAppointment

};
