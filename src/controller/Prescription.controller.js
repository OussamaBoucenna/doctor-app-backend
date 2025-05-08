
// ================ CONTROLLERS ================
// controllers/prescriptionController.js
const prescriptionService = require('../service/Prescription.service');

  const  getAllPrescriptions =async (req, res) => {
    try {
      const prescriptions = await prescriptionService.getAllPrescriptions();
      return res.status(200).json({
        success: true,
        prescriptions
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  const  getPrescriptionById = async (req, res) => {
    try {
      const prescription = await prescriptionService.getPrescriptionById(req.params.id);
      return res.status(200).json({
        success: true,
        prescription
      });
    } catch (error) {
      return res.status(error.message === 'Prescription not found' ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

  const  getPrescriptionsByDoctor = async (req, res) => {
    try {
      const prescriptions = await prescriptionService.getPrescriptionsByDoctor(req.params.doctorId);
      return res.status(200).json({
        success: true,
        prescriptions
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  const  getPrescriptionsByPatient = async (req, res)=> {
    try {
      const prescriptions = await prescriptionService.getPrescriptionsByPatient(req.params.patientId);
      return res.status(200).json({
        success: true,
        prescriptions
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  const createPrescription = async (req, res) => {
    console.log("request recived  --> ", req.body)
    try {
      // Transformer les données du frontend en format attendu par le service
      const prescriptionData = {
        patientId: parseInt(req.body.patientId),
        doctorId: parseInt(req.body.doctorId),
        appointmentId: req.body.appointmentId ? parseInt(req.body.appointmentId) : null, // Ajout du champ appointmentId
        instructions: req.body.instructions,
        expiryDate: req.body.expiryDate,
        medications: req.body.medications
      };
      
      const prescription = await prescriptionService.createPrescription(prescriptionData);
      console.log("prescription created --> ", prescription)
      
      return res.status(201).json({
        success: true,
        message: 'Prescription créée avec succès',
        prescription
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  const  updatePrescription = async (req, res) => {
    try {
      const prescriptionData = {
        patientId: parseInt(req.body.patientId),
        doctorId: parseInt(req.body.doctorId),
        instructions: req.body.instructions,
        expiryDate: req.body.expiryDate,
        medications: req.body.medications
      };

      const prescription = await prescriptionService.updatePrescription(req.params.id, prescriptionData);
      return res.status(200).json({
        success: true,
        message: 'Prescription mise à jour avec succès',
        prescription
      });
    } catch (error) {
      return res.status(error.message === 'Prescription not found' ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
  }

  const deletePrescription = async (req, res) => {
    try {
      await prescriptionService.deletePrescription(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Prescription supprimée avec succès'
      });
    } catch (error) {
      return res.status(error.message === 'Prescription not found' ? 404 : 500).json({
        success: false,
        message: error.message
      });
    }
  }

module.exports = {
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionsByDoctor,
  getPrescriptionsByPatient,
  createPrescription,
  updatePrescription,
  deletePrescription
};