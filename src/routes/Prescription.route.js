// ================ ROUTES ================
// routes/prescriptionRoutes.js
const express = require('express');
const router = express.Router();
const prescriptionController = require('./../controller/Prescription.controller');
const Prescription = require('./../model/Prescription.model');
const Medication = require('./../model/Medication.model');
const Appointment = require('./../model/Appointment.model');
const { authMiddleware, getDoctor } = require('../middlewares/Auth');
const { sequelize } = require('./../config/config');

// Routes pour les prescriptions
router.get('/', prescriptionController.getAllPrescriptions);
router.get('/:id', prescriptionController.getPrescriptionById);
router.get('/doctor/:doctorId',  prescriptionController.getPrescriptionsByDoctor);
router.get('/patient/:patientId', prescriptionController.getPrescriptionsByPatient);
router.post('/', authMiddleware,getDoctor,prescriptionController.createPrescription);
router.post('/sync-prescriptions', authMiddleware , getDoctor ,async (req, res) => {
  const prescriptions = req.body.prescriptions;
  const   doctorId = req.doctorId; 
  console.log('Received prescriptions:', prescriptions);

  if (!Array.isArray(prescriptions)) {
    return res.status(400).json({ message: 'Prescriptions must be an array' });
  }

  const savedPrescriptions = [];
// Commencer une transaction
const t = await sequelize.transaction();

try {
  for (const item of prescriptions) {
    const {
      appointmentId,
      patientId,
      instructions,
      expiryDate,
      medications
    } = item;

    const prescription = await Prescription.create({
      patient_id: patientId,
      doctor_id: doctorId,
      instructions: instructions,
      expiry_date: expiryDate
    }, { transaction: t }); // ← important !

    for (const med of medications) {
      await Medication.create({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        prescription_id: prescription.prescription_id
      }, { transaction: t }); // ← important !
    }

          savedPrescriptions.push({ id: prescription.prescription_id, success: true });

     const appointment = await Appointment.findByPk(appointmentId, { transaction: t });

    if (appointment) {
      appointment.status = 'COMPLETED';
      await appointment.save({ transaction: t });
    } else {
      throw new Error(`Appointment with ID ${appointmentId} not found`);
    }


  }

      await t.commit(); 
        res.json({ success: true, results: savedPrescriptions });

    } catch (error) {
      console.error(error);
       await t.rollback();
      savedPrescriptions.push({ error: error.message, success: false });
        res.json({ success: false, results: savedPrescriptions });

    }
  

});

router.put('/:id', prescriptionController.updatePrescription);
router.delete('/:id', prescriptionController.deletePrescription);

module.exports = router;