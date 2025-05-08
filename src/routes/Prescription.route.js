// ================ ROUTES ================
// routes/prescriptionRoutes.js
const express = require('express');
const router = express.Router();
const prescriptionController = require('./../controller/Prescription.controller');

// Routes pour les prescriptions
router.get('/', prescriptionController.getAllPrescriptions);
router.get('/:id', prescriptionController.getPrescriptionById);
router.get('/doctor/:doctorId',  prescriptionController.getPrescriptionsByDoctor);
router.get('/patient/:patientId', prescriptionController.getPrescriptionsByPatient);
router.post('/', prescriptionController.createPrescription);
router.put('/:id', prescriptionController.updatePrescription);
router.delete('/:id', prescriptionController.deletePrescription);

module.exports = router;