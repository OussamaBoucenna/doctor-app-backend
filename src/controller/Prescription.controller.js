
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
    //console.log("request recived  --> ",req.body)
    try {
      // Transformer les données du frontend en format attendu par le service
      const prescriptionData = {
        appointmentId: parseInt(req.body.appointmentId),
        patientId: parseInt(req.body.patientId),
        doctorId: req.doctorId,
        instructions: req.body.instructions,
        expiryDate: req.body.expiryDate,
        medications: req.body.medications
      };

      const prescription = await prescriptionService.createPrescription(prescriptionData);
     
     
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

  const getPrescriptionsByAppointmentId = async (req, res) => {
    const { appointmentId } = req.params;
  
    try {
      const prescriptions = await prescriptionService.fetchPrescriptionsByAppointment(appointmentId);
  
      if (!prescriptions) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
  
      return res.status(200).json({
        success: true,
        message: 'Prescriptions fetched successfully',
        data: prescriptions
      });
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  };

module.exports = {
  getAllPrescriptions,
  getPrescriptionsByAppointmentId,
  getPrescriptionById,
  getPrescriptionsByDoctor,
  getPrescriptionsByPatient,
  createPrescription,
  updatePrescription,
  deletePrescription
};