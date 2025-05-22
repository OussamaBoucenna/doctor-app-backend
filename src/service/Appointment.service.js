// services/appointment.service.js
// services/appointment.service.js
const { Op } = require('sequelize');
const moment = require('moment');
const QRCode = require('qrcode');
const AppointmentSlot = require('../model/AppointmentSlot.model');
const DoctorSchedule = require('../model/doctorSchedule.model');
const Appointment = require('../model/Appointment.model');
const Doctor = require('../model/Doctor.model');
const Patient = require('../model/Patient.model');
const User = require('../model/User.model');
const QRCodeData = require('../model/qrCodeData.model');
const Specialty = require('../model/Specialty.model');
const calculateAge = require('../utils/calculateAge'); // Assuming you have a utility function to calculate age
const { sendNotificationToUser } = require("./../utils/fcm");
const notificationService = require("./Notification.service");


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

    // Step 5: Generate QR Code data
    const timestamp = moment().unix();
    const content = `Appointment for patient ${patient.patient_id} at slot ${data.slot_id}`;
    console.log("content ----------->", appointment);
    const qrPayload = {
      appointmentId: appointment.appointment_id.toString(),
      content,
      timestamp
    };

    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrPayload));

    // Step 6: Update appointment with QR data
    appointment.qr_data = {
      ...qrPayload,
      image: qrCodeImage
    };
    await appointment.save({ transaction: t });

    // Step 7: Optionally store QRCodeData in separate table
    await QRCodeData.create({
      id: appointment.appointment_id.toString(),
      content,
      timestamp
    }, { transaction: t });

    await t.commit();

    return {
      success: true,
      message: 'Appointment booked and QR code generated successfully.',
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
      appointment_id: appointment.appointment_id.toString(),
      "APPOINTMENT_SLOT.DOCTOR_SCHEDULE.doctor_id": appointment.APPOINTMENT_SLOT?.DOCTOR_SCHEDULE?.doctor_id?.toString(),
      patientId: appointment.patient_id.toString(),
      "APPOINTMENT_SLOT.working_date": appointment.APPOINTMENT_SLOT?.working_date,
      "APPOINTMENT_SLOT.start_time": appointment.APPOINTMENT_SLOT?.start_time,
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
      appointment_id: appointment.appointment_id.toString(),
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
      where: { patient_id: patient.patient_id , status: 'CONFIRMED'},
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
      appointment_id: appointment.appointment_id.toString(),
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

  
  
   
  const apnt = await Appointment.findByPk(appointmentId, {
  include: [
    {
      model: Patient,
      as: 'PATIENT',
      include: {
        model: User,
        as: 'USER',
        attributes: ['user_id', 'first_name', 'last_name']
      }
    },
    {
      model: AppointmentSlot,
      as: 'APPOINTMENT_SLOT',
      include: {
        model: DoctorSchedule,
        as: 'DOCTOR_SCHEDULE',
        include: {
          model: Doctor,
          as: 'DOCTOR',
          include: {
            model: User,
            as: 'USER',
            attributes: ['user_id']
          }
        }
      }
    }
  ]
});

console.log("apnt ----------->", apnt.APPOINTMENT_SLOT.DOCTOR_SCHEDULE.DOCTOR.USER.user_id); ;

 const notification = { 
    title : "Appointment Canceled ",
    message :  `Your appointment with the patient ${apnt.PATIENT.USER.first_name} ${apnt.PATIENT.USER.last_name} on ${apnt.APPOINTMENT_SLOT.working_date} at  ${apnt.APPOINTMENT_SLOT.start_time} -  ${appointment.APPOINTMENT_SLOT.end_time}  has been canceled`  ,
    }
  await notificationService.createNotification(apnt.APPOINTMENT_SLOT.DOCTOR_SCHEDULE.DOCTOR.USER.user_id,notification ) ;


  
 const notifications = { 
    title : "Appointment Canceled ",
    message :  `Your appointment with the Doctor ${apnt.APPOINTMENT_SLOT.DOCTOR_SCHEDULE.DOCTOR.USER.first_name} ${apnt.APPOINTMENT_SLOT.DOCTOR_SCHEDULE.DOCTOR.USER.last_name} on ${apnt.APPOINTMENT_SLOT.working_date} at  ${apnt.APPOINTMENT_SLOT.start_time} -  ${appointment.APPOINTMENT_SLOT.end_time}  has been canceled`  ,
    }
  await notificationService.createNotification(apnt.PATIENT.USER.user_id,notifications ) ;


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


const confirmAppointment = async (appointmentId) => {
  const appointment = await Appointment.findByPk(appointmentId, {
  include: [
    {
      model: Patient,
      as: 'PATIENT',
      include: {
        model: User,
        as: 'USER',
        attributes: ['user_id']
      }
    },
    {
      model: AppointmentSlot,
      as: 'APPOINTMENT_SLOT',
      include: {
        association: 'DOCTOR_SCHEDULE', // Assure-toi que cette association est bien définie
      }
    }
  ]
});
  console.log("appointment ----------->", appointment.PATIENT);
  if (!appointment) throw new Error('NOT_FOUND');
  if (appointment.status === 'CONFIRMED') throw new Error('ALREADY_CONFIRMED');

  appointment.status = 'CONFIRMED';
  await appointment.save();
  
   const notification = { 
    title : "Appointment Confirmation ",
    message :  `Your appointment with the doctor on ${appointment.APPOINTMENT_SLOT.working_date} at  ${appointment.APPOINTMENT_SLOT.start_time} -  ${appointment.APPOINTMENT_SLOT.end_time}  has been confirmed`  ,
    }
  await notificationService.createNotification(appointment.PATIENT.USER.user_id,notification ) ;

  // Formaté comme demandé
  return {
    success: true,
    message: "Appointment confirmed.",
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


// const getPendingAppointmentsByDoctorAndDay = async (doctorId, dateString) => {
//   // Convertir la date reçue ("May 24, 2025 3:43:08 PM") en format "YYYY-MM-DD"
//   const date = new Date(dateString);  // "May 24, 2025 3:43:08 PM"
//   const today = date.toISOString().split('T')[0];  // "2025-05-24"
//   const todaysAppointments = await Appointment.findAll({
//       include: [
//         {
//           model: AppointmentSlot,
//           where: {
//             working_date: today
//           },
//           include: [
//             {
//               model: DoctorSchedule,
//               where: { doctor_id: doctorId }
//             }
//           ]
//         },
//         {
//           model: Patient,
//           include: [
//             {
//               model: User,
//               attributes: ['first_name', 'last_name', 'email', 'phone']
//             }
//           ]
//         }
//       ],
//       where: {
//         status: {
//           [Op.in]: ['PENDING', 'CONFIRMED']
//         }
//       },
//       order: [
//         [AppointmentSlot, 'start_time', 'ASC']
//       ]
//     });

//     if (!todaysAppointments || todaysAppointments.length === 0) {
//       return  new Error("No appointments found for the given date.");
      
//     }

//     const formatted = await Promise.all(todaysAppointments.map(async (appointment) => {
//       const count = await countAppointmentsForPatientAndDoctor(appointment.patient_id, doctorId);
//       return {
//         appointment_id: appointment.appointment_id,
//         patient_id: appointment.patient_id,
//         status: appointment.status,
//         fullname: `${appointment.PATIENT.USER.first_name} ${appointment.PATIENT.USER.last_name}`,
//         start_time: appointment.APPOINTMENT_SLOT.start_time,
//         reason: appointment.reason,
//         numberOfVisit: count
//       };
//     }));

//     return formatted;

// };


const getPendingAppointmentsByDoctorAndDay = async (doctorId, dateString) => {
  try {
    // Convertir la date reçue ("May 24, 2025 3:43:08 PM") en format "YYYY-MM-DD"
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Date invalide fournie");
    }

    const today = date.toISOString().split('T')[0];  // "2025-05-24"


    console.log("today ----------->", today);
    
    const todaysAppointments = await Appointment.findAll({
      include: [
        {
          model: AppointmentSlot,
          where: {
            working_date: today
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
              attributes: ['first_name', 'last_name', 'email', 'phone','image']
            }
          ]
        }
      ],
      where: {
        status: {
          [Op.in]: ['PENDING']
        }
      },
      order: [
        [AppointmentSlot, 'start_time', 'ASC']
      ]
    });
     console.log("todaysAppointments ----------->", todaysAppointments);
    if (!todaysAppointments || todaysAppointments.length === 0) {
      console.log("Aucun rendez-vous trouvé pour la date donnée.");
      return [];  // Retourner un tableau vide plutôt qu'une erreur
    }
    
    const formatted = await Promise.all(todaysAppointments.map(async (appointment) => {
      try {
        const count = await countAppointmentsForPatientAndDoctor(appointment.patient_id, doctorId);
        return {
          appointement_id: appointment.appointment_id,
          patient_id: appointment.patient_id,
          status: appointment.status,
          fullname: `${appointment.PATIENT.USER.first_name} ${appointment.PATIENT.USER.last_name}`,
          start_time: appointment.APPOINTMENT_SLOT.start_time,
          reason: appointment.reason,
          imageUrl: appointment.PATIENT.USER.image,
          numberOfVisit: count
        };
      } catch (error) {
        console.error(`Erreur lors du traitement de l'appointment ${appointment.appointment_id}:`, error);
        // Retourner l'objet avec les données de base mais sans le nombre de visites
        return {
          appointment_id: appointment.appointment_id,
          patient_id: appointment.patient_id,
          status: appointment.status,
          fullname: `${appointment.PATIENT.USER.first_name} ${appointment.PATIENT.USER.last_name}`,
          start_time: appointment.APPOINTMENT_SLOT.start_time,
          reason: appointment.reason,
          imageUrl: appointment.PATIENT.USER.image,
          numberOfVisit: 0  
        };
      }
    }));
    
    return formatted;
    
  } catch (error) {
    console.error("Erreur dans getPendingAppointmentsByDoctorAndDay:", error);
    throw new Error(`Impossible de récupérer les rendez-vous: ${error.message}`);
  }
};

const getConfirmedAppointmentsByDoctorAndDay = async (doctorId, dateString) => {
  try {
    // Convert date string to YYYY-MM-DD
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Date invalide fournie");
    }

    const today = date.toISOString().split("T")[0];

    const confirmedAppointments = await Appointment.findAll({
      include: [
        {
          model: AppointmentSlot,
          where: { working_date: today },
          include: [
            {
              model: DoctorSchedule,
              where: { doctor_id: doctorId },
              include: [
                {
                  model: Doctor,
                  include: [
                    {
                      model: User,
                      attributes: ['first_name', 'last_name']
                    }
                  ]
                }
              ]
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
          [Op.in]: ['CONFIRMED']
        }
      },
      order: [[AppointmentSlot, 'start_time', 'ASC']]
    });

    if (!confirmedAppointments || confirmedAppointments.length === 0) {
      return [];
    }

    const formatted = confirmedAppointments.map((appointment) => {
      const slot = appointment.APPOINTMENT_SLOT;
      const doctorUser = slot.DOCTOR_SCHEDULE?.DOCTOR?.USER;
      const patientUser = appointment.PATIENT?.USER;

      return {
        appointment_id: appointment.appointment_id,
        slot_id: slot.slot_id,
        patient_id: appointment.patient_id,
        status: appointment.status,
        reason: appointment.reason,
        slot_info: {
          start_time: slot.start_time,
          end_time: slot.end_time,
          working_date: slot.working_date,
          is_booked: slot.is_booked
        },
        patient_info: {
          name: `${patientUser.first_name} ${patientUser.last_name}`,
          email: patientUser.email,
          phone: patientUser.phone
        },
        doctor_info: {
          doctor_id: doctorId,
          name: `${doctorUser.first_name} ${doctorUser.last_name}`
        }
      };
    });

    return formatted;
  } catch (error) {
    console.error("Erreur dans getConfirmedAppointmentsByDoctorAndDay:", error);
    throw new Error(`Impossible de récupérer les rendez-vous confirmés: ${error.message}`);
  }
};



module.exports = {
  countAppointmentsForPatientAndDoctor,
  getPendingAppointmentsByDoctorAndDay,
  getConfirmedAppointmentsByDoctorAndDay,
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByPatientId,
  getFirstUpcomingAppointmentByPatientId,
  updateAppointment,
  deleteAppointment,
  getAppointmentDetailsById,
  cancelAppointment,
  confirmAppointment

};
