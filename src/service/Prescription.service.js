// ================ SERVICES ================
// services/prescriptionService.js
const { sequelize } = require('../config/config');
const { Op, Sequelize } = require('sequelize');
const Prescription = require('../model/Prescription.model');
const Medication = require('../model/Medication.model');
const Doctor = require('../model/Doctor.model');
const Patient = require('../model/Patient.model');
const User = require('../model/User.model');
const Specialty = require('../model/Specialty.model');
const AppointmentSlot = require('../model/AppointmentSlot.model');
const DoctorSchedule = require('../model/DoctorSchedule.model');
const Appointment = require('../model/Appointment.model');
const transformPrescription = require('./../utils/PrescriptionTransformers'); // Assurez-vous que ce chemin est correct

  const  getAllPrescriptions= async () =>  {
    try {
      return await Prescription.findAll({
        include: [
          { model: Medication },
          { 
            model: Doctor, 
            include: [{
              model: User,
              attributes: ['user_id', 'first_name', 'last_name', 'email']
            }]
          },
          { 
            model: Patient, 
            include: [{
              model: User,
              attributes: ['user_id', 'first_name', 'last_name', 'email']
            }]
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching prescriptions: ${error.message}`);
    }
  }
  const getPrescriptionById = async (id) => {
    try {
      const prescriptionData = await Prescription.findByPk(id, {
        include: [
          { model: Medication },
          { 
            model: Doctor, 
            include: [
              {
                model: User,
                attributes: ['user_id', 'first_name', 'last_name', 'email'],
              },
              {
                model: Specialty, // Pas besoin de `as`
                attributes: ['specialty_id', 'name']
              }
            ]
          },
          { 
            model: Patient, 
            include: [
              {
                model: User,
                attributes: ['user_id', 'first_name', 'last_name', 'email'],
              }
            ]
          }
        ]
      });
    
      const prescription = transformPrescription(prescriptionData.dataValues);
  
      if (!prescription) {
        throw new Error('Prescription not found');
      }
  
      return prescription;
    } catch (error) {
      throw new Error(`Error fetching prescription: ${error.message}`);
    }
  };
  
  const  getPrescriptionsByDoctor= async (doctorId)=> {
    try {
      return await Prescription.findAll({
        where: { doctor_id: doctorId },
        include: [
          { model: Medication },
          { 
            model: Patient, 
            include: [{
              model: User,
              attributes: ['user_id', 'first_name', 'last_name', 'email']
            }]
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching doctor's prescriptions: ${error.message}`);
    }
  }

  const  getPrescriptionsByPatient= async (patientId) => {
    try {
      return await Prescription.findAll({
        where: { patient_id: patientId },
        include: [
          { model: Medication },
          { 
            model: Doctor, 
            include: [{
              model: User,
              attributes: ['user_id', 'first_name', 'last_name', 'email'],
            }]
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error fetching patient's prescriptions: ${error.message}`);
    }
  }

  // const  createPrescription = async(prescriptionData)=> {
  // //  const transaction = await sequelize.transaction();
  // // console.log("prescriptionData -->",prescriptionData)
  //   try {
  //     // Vérifier si le docteur et le patient existent
  //     const doctor = await Doctor.findByPk(prescriptionData.doctorId, {
  //       include: [{ model: User }]
  //     });
      
  //     const patient = await Patient.findByPk(prescriptionData.patientId, {
  //       include: [{ model: User}]
  //     });
  //    //console.log("doctor -->",doctor)
  //    //console.log("user -->",doctor.User)
  
  //     if (!doctor || !doctor.USER.dataValues || doctor.USER.dataValues.role !== 'doctor') {
  //       throw new Error('Le médecin spécifié n\'existe pas ou n\'est pas un médecin');
  //     }

  //     if (!patient || !patient.USER.dataValues || patient.USER.dataValues.role !== 'patient') {
  //       throw new Error('Le patient spécifié n\'existe pas ou n\'est pas un patient');
  //     }

  //     // Créer la prescription
  //     // const prescription = await Prescription.create({
  //     //   patient_id: prescriptionData.patientId,
  //     //   doctor_id: prescriptionData.doctorId,
  //     //   instructions: prescriptionData.instructions,
  //     //   expiry_date: new Date(prescriptionData.expiryDate)
  //     // }, { transaction });
  //     const prescription = await Prescription.create({
  //       patient_id: prescriptionData.patientId,
  //       doctor_id: prescriptionData.doctorId,
  //       instructions: prescriptionData.instructions,
  //       expiry_date: new Date(prescriptionData.expiryDate)
  //     }, );

  //     // Créer les médicaments associés
  //     if (prescriptionData.medications && prescriptionData.medications.length > 0) {
  //       const medicationsToCreate = prescriptionData.medications.map(med => ({
  //         prescription_id: prescription.prescription_id,
  //         name: med.name,
  //         dosage: med.dosage,
  //         frequency: med.frequency,
  //         duration: med.duration
  //       }));

  //      // await Medication.bulkCreate(medicationsToCreate, { transaction });
  //       await Medication.bulkCreate(medicationsToCreate);
  //     }

  //     //console.log("prescription -->",prescription.prescription_id)
  //     // await transaction.commit();

  //     // Récupérer la prescription créée avec ses médicaments
  //     const newPrescription = await getPrescriptionById(prescription.prescription_id);

  //     return  newPrescription;
  //   } catch (error) {
  //     // await transaction.rollback();
  //     throw new Error(`Error creating prescription: ${error.message}`);
  //   }
  // }

  const  updatePrescription = async (id, prescriptionData) => {
    const transaction = await sequelize.transaction();

    try {
      // Vérifier si la prescription existe
      const prescription = await Prescription.findByPk(id);
      if (!prescription) {
        throw new Error('Prescription not found');
      }

      // Vérifier si le docteur et le patient existent
      const doctor = await Doctor.findByPk(prescriptionData.doctorId, {
        include: [{ model: User }]
      });
      
      const patient = await Patient.findByPk(prescriptionData.patientId, {
        include: [{ model: User }]
      });

      if (!doctor || !doctor.User || doctor.User.role !== 'doctor') {
        throw new Error('Le médecin spécifié n\'existe pas ou n\'est pas un médecin');
      }

      if (!patient || !patient.User || patient.User.role !== 'patient') {
        throw new Error('Le patient spécifié n\'existe pas ou n\'est pas un patient');
      }

      // Mettre à jour la prescription
      await prescription.update({
        patient_id: prescriptionData.patientId,
        doctor_id: prescriptionData.doctorId,
        instructions: prescriptionData.instructions,
        expiry_date: new Date(prescriptionData.expiryDate)
      }, { transaction });

      // Supprimer les médicaments existants
      await Medication.destroy({
        where: { prescription_id: id },
        transaction
      });

      // Créer les nouveaux médicaments
      if (prescriptionData.medications && prescriptionData.medications.length > 0) {
        const medicationsToCreate = prescriptionData.medications.map(med => ({
          prescription_id: id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration
        }));

        await Medication.bulkCreate(medicationsToCreate, { transaction });
      }

      await transaction.commit();

      // Récupérer la prescription mise à jour avec ses médicaments
      return await this.getPrescriptionById(id);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error updating prescription: ${error.message}`);
    }
  }

  const deletePrescription = async (id)=> {
    const transaction = await sequelize.transaction();

    try {
      // Vérifier si la prescription existe
      const prescription = await Prescription.findByPk(id);
      if (!prescription) {
        throw new Error('Prescription not found');
      }

      // Supprimer d'abord les médicaments associés
      await Medication.destroy({
        where: { prescription_id: id },
        transaction
      });

      // Supprimer la prescription
      await prescription.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error deleting prescription: ${error.message}`);
    }
  }

  const createPrescription = async(prescriptionData) => {
    const transaction = await sequelize.transaction();
    console.log("prescription => ",prescriptionData)
    try {
      // First, confirm the appointment if an appointmentId is provided
      if (prescriptionData.appointmentId) {
        console.log("appointmentId => ",prescriptionData.appointmentId)
        const appointment = await Appointment.findByPk(prescriptionData.appointmentId, {
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
                association: 'DOCTOR_SCHEDULE',
              }
            }
          ],
          transaction
        });
  
        if (!appointment) throw new Error('Appointment not found');
        if (appointment.status !== 'COMPLETED') {
          appointment.status = 'COMPLETED';
          console.log("appointment.status -->", appointment.status);
          await appointment.save({ transaction });
        }
      

        // use the ones from the appointment
        if (!prescriptionData.doctorId && appointment.APPOINTMENT_SLOT?.DOCTOR_SCHEDULE?.doctor_id) {
          prescriptionData.doctorId = appointment.APPOINTMENT_SLOT.DOCTOR_SCHEDULE.doctor_id;
        }
        
        if (!prescriptionData.patientId && appointment.patient_id) {
          prescriptionData.patientId = appointment.patient_id;
        }
      }
  
      // Verify doctor and patient exist
      const doctor = await Doctor.findByPk(prescriptionData.doctorId, {
        include: [{ model: User, as: 'USER' }],
        transaction
      });
      
      const patient = await Patient.findByPk(prescriptionData.patientId, {
        include: [{ model: User, as: 'USER' }],
        transaction
      });
  
      if (!doctor || !doctor.USER.dataValues || doctor.USER.dataValues.role !== 'doctor') {
        throw new Error('Le médecin spécifié n\'existe pas ou n\'est pas un médecin');
      }
      
      if (!patient || !patient.USER.dataValues || patient.USER.dataValues.role !== 'patient') {
        throw new Error('Le patient spécifié n\'existe pas ou n\'est pas un patient');
      }
  
      // Create prescription
      const prescription = await Prescription.create({
        patient_id: prescriptionData.patientId,
        doctor_id: prescriptionData.doctorId,
        instructions: prescriptionData.instructions,
        expiry_date: new Date(prescriptionData.expiryDate)
      }, { transaction });
  
      // Create associated medications
      if (prescriptionData.medications && prescriptionData.medications.length > 0) {
        const medicationsToCreate = prescriptionData.medications.map(med => ({
          prescription_id: prescription.prescription_id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration
        }));
        
        await Medication.bulkCreate(medicationsToCreate, { transaction });
      }
  
      // Commit transaction
      await transaction.commit();
  
      // Retrieve the created prescription with its medications
      const newPrescription = await getPrescriptionById(prescription.prescription_id);
      
      // Format and return combined results
      const result = {
        success: true,
        message: "Prescription created successfully",
        prescription: newPrescription
      };
      
      // Add appointment information if an appointment was confirmed
      if (prescriptionData.appointmentId) {
        const confirmationDetails = await Appointment.findByPk(prescriptionData.appointmentId, {
          include: [
            {
              model: AppointmentSlot,
              as: 'APPOINTMENT_SLOT',
              include: {
                association: 'DOCTOR_SCHEDULE',
              }
            }
          ]
        });
        
        result.appointmentConfirmation = {
          id: confirmationDetails.appointment_id.toString(),
          doctorId: confirmationDetails.APPOINTMENT_SLOT?.DOCTOR_SCHEDULE?.doctor_id?.toString(),
          patientId: confirmationDetails.patient_id.toString(),
          workingDate: confirmationDetails.APPOINTMENT_SLOT?.working_date,
          startTime: confirmationDetails.APPOINTMENT_SLOT?.start_time,
          status: confirmationDetails.status,
          reason: confirmationDetails.reason
        };
      }
      
      return result;
      
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw new Error(`Error processing request: ${error.message}`);
    }
  };

  const fetchPrescriptionsByAppointment = async (appointmentId) => {
    const appointment = await Appointment.findOne({
      where: { appointment_id: appointmentId },
      include: [
        {
          model: AppointmentSlot,
          attributes: ['working_date', 'start_time', 'end_time'],
        },
        {
          model: Patient,
          attributes: ['date_birthday', 'patient_id'],
          include: [
            { model: User, attributes: ['user_id', 'first_name', 'last_name', 'email'] }
          ],
        }
      ]
    });
  
    if (!appointment) {
      return null;
    }
  
    // Extract patient info
    const patient = appointment.PATIENT;
    
    if (!patient || !patient.USER) {
      throw new Error("Patient or user info missing");
    }
  
    const patientId = patient.patient_id;
    const patientName = `${patient.USER.first_name} ${patient.USER.last_name}`;
  
    // Calculate age from date_birthday
    const birthDate = new Date(patient.date_birthday);
    const today = new Date();
    let patientAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      patientAge--;
    }
  
    // Appointment time formatting
    console.log("appointment.APPOINTMENT_SLOTS -->",appointment.APPOINTMENT_SLOT)
    const workingDate = appointment.APPOINTMENT_SLOT.dataValues.working_date;
    const startTime = appointment.APPOINTMENT_SLOT.dataValues.start_time;
    const endTime = appointment.APPOINTMENT_SLOT.dataValues.end_time;
    const appointmentTime = `${startTime} - ${endTime}`;
  
    // Date range for prescriptions
    const startOfDay = new Date(workingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(workingDate);
    endOfDay.setHours(23, 59, 59, 999);
  
    // Fetch prescriptions for the patient on that day
    const prescriptions = await Prescription.findAll({
      where: {
        patient_id: patientId,
        // created_at: {
        //   [Sequelize.Op.between]: [created_at, endOfDay]
        // }
      }
    });
  
    // Return combined info with theme added to prescriptions
    return {
      patientName,
      patientAge,
      appointmentTime,
      prescriptions
    };
  };
  
  
  


module.exports = {fetchPrescriptionsByAppointment,getAllPrescriptions,getPrescriptionById,getPrescriptionsByDoctor,getPrescriptionsByPatient,createPrescription,updatePrescription,deletePrescription};