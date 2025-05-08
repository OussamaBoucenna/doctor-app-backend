// ================ SERVICES ================
// services/prescriptionService.js
const { sequelize } = require('../config/config');
const Prescription = require('../model/Prescription.model');
const Medication = require('../model/Medication.model');
const Doctor = require('../model/Doctor.model');
const Patient = require('../model/Patient.model');
const User = require('../model/User.model');
const Specialty = require('../model/Specialty.model');
const Appointment = require('../model/Appointment.model');
const AppointmentSlot = require('../model/AppointmentSlot.model');
const DoctorSchedule = require('../model/DoctorSchedule.model');
const transformPrescription = require('./../utils/PrescriptionTransformers'); // Assurez-vous que ce chemin est correct

  const  getAllPrescriptions= async () =>  {
    try {
      return await Prescription.findAll({
        include: [
          { model: Medication },
          { 
            model: Doctor, 
            as: 'Doctor',
            include: [{
              model: User,
              attributes: ['user_id', 'first_name', 'last_name', 'email']
            }]
          },
          { 
            model: Patient, 
            as: 'Patient',
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
            as: 'Doctor',
            include: [
              {
                model: User,
                attributes: ['user_id', 'first_name', 'last_name', 'email'],
                as: 'user'
              },
              {
                model: Specialty,
                attributes: ['specialty_id', 'name']
              }
            ]
          },
          {
            model: Patient,
            as: 'Patient',
            include: [
              {
                model: User,
                attributes: ['user_id', 'first_name', 'last_name', 'email'],
                as: 'user'
              }
            ]
          },
          {
            model: Appointment,
            as: 'Appointment',
            include: [
              {
                model: AppointmentSlot,
                include: [
                  {
                    model: DoctorSchedule
                  }
                ]
              }
            ]
          }
        ]
      });
  
      if (!prescriptionData) {
        return {
          success: false,
          message: "Prescription not found",
          prescription: null
        };
      }
  
      const transformedResponse = transformPrescription(prescriptionData);
      return transformedResponse;
      
    } catch (error) {
      return {
        success: false,
        message: `Error fetching prescription: ${error.message}`,
        prescription: null
      };
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
            as: 'Patient',
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
            as: 'Doctor',
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
  const createPrescription = async(prescriptionData)=> {
    //  const transaction = await sequelize.transaction();
    // console.log("prescriptionData -->",prescriptionData)
    
    try {
      // Vérifier si le docteur et le patient existent
      const doctor = await Doctor.findByPk(prescriptionData.doctorId, {
        include: [{ model: User, as: 'user' }]
      });
      
      const patient = await Patient.findByPk(prescriptionData.patientId, {
        include: [{ model: User, as: 'user' }]
      });
      // console.log(doctor)
      // console.log("user -->",doctor.user)
      
      if (!doctor || !doctor.user || doctor.user.role !== 'doctor') {
        throw new Error('Le médecin spécifié n\'existe pas ou n\'est pas un médecin');
      }
      
      if (!patient || !patient.user || patient.user.role !== 'patient') {
        throw new Error('Le patient spécifié n\'existe pas ou n\'est pas un patient');
      }
      
      // Vérifier si l'appointement existe si un appointmentId est fourni
      if (prescriptionData.appointmentId) {
        const appointment = await Appointment.findByPk(prescriptionData.appointmentId);
         console.log("appointment -->",appointment)
        if (!appointment) {
          throw new Error('Le rendez-vous spécifié n\'existe pas');
        }
        
        // Vérifier que le rendez-vous correspond bien au même patient
        if (appointment.patient_id !== prescriptionData.patientId) {
          throw new Error('Le rendez-vous ne correspond pas au patient spécifié');
        }
      }
      
      // Créer la prescription avec le nouveau champ appointment_id
      console.log("prescriptionData -->",prescriptionData.appointmentId)
      const prescription = await Prescription.create({
        patient_id: prescriptionData.patientId,
        doctor_id: prescriptionData.doctorId,
        appointment_id: prescriptionData.appointmentId, // Ajout du champ appointment_id
        instructions: prescriptionData.instructions,
        expiry_date: new Date(prescriptionData.expiryDate)
      });

      console.log("prescription -->", prescription)
      
      // Créer les médicaments associés
      if (prescriptionData.medications && prescriptionData.medications.length > 0) {
        const medicationsToCreate = prescriptionData.medications.map(med => ({
          prescription_id: prescription.prescription_id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration
        }));
        console.log("medicationsToCreate -->", medicationsToCreate)
        
        await Medication.bulkCreate(medicationsToCreate);
      }
      
      console.log("prescription -->", prescription.prescription_id)
      
      // Récupérer la prescription créée avec ses médicaments
      const newPrescription = await getPrescriptionById(prescription.prescription_id);
      
      return newPrescription;
    } catch (error) {
      throw new Error(`Error creating prescription: ${error.message}`);
    }
  }

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


module.exports = {getAllPrescriptions,getPrescriptionById,getPrescriptionsByDoctor,getPrescriptionsByPatient,createPrescription,updatePrescription,deletePrescription};