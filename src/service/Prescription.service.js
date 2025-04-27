// ================ SERVICES ================
// services/prescriptionService.js
const { sequelize } = require('../config/config');
const Prescription = require('../model/Prescription.model');
const Medication = require('../model/Medication.model');
const Doctor = require('../model/Doctor.model');
const Patient = require('../model/Patient.model');
const User = require('../model/User.model');

class PrescriptionService {
  async getAllPrescriptions() {
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

  async getPrescriptionById(id) {
    try {
      const prescription = await Prescription.findByPk(id, {
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

      if (!prescription) {
        throw new Error('Prescription not found');
      }

      return prescription;
    } catch (error) {
      throw new Error(`Error fetching prescription: ${error.message}`);
    }
  }

  async getPrescriptionsByDoctor(doctorId) {
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

  async getPrescriptionsByPatient(patientId) {
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

  async createPrescription(prescriptionData) {
    const transaction = await sequelize.transaction();

    try {
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

      // Créer la prescription
      const prescription = await Prescription.create({
        patient_id: prescriptionData.patientId,
        doctor_id: prescriptionData.doctorId,
        instructions: prescriptionData.instructions,
        expiry_date: new Date(prescriptionData.expiryDate)
      }, { transaction });

      // Créer les médicaments associés
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

      await transaction.commit();

      // Récupérer la prescription créée avec ses médicaments
      return await this.getPrescriptionById(prescription.prescription_id);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error creating prescription: ${error.message}`);
    }
  }

  async updatePrescription(id, prescriptionData) {
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

  async deletePrescription(id) {
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
}

module.exports = new PrescriptionService();