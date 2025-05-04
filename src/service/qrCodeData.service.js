const QRCode = require('qrcode');  // Pour générer le QR code (package npm)
const moment = require('moment');
const Appointment = require('../model/Appointment.model');  // Import du modèle Appointment

// Fonction pour générer et ajouter un QR code
async function generateQRCodeForAppointment(appointmentId, content) {
  const timestamp = moment().unix();  // Obtenir le timestamp actuel en secondes
  
  // Structurer les données du QR code
  const qrCodeData = {
    id: appointmentId.toString(),
    content: content,
    timestamp: timestamp
  };

  // Générer le QR code (base64 string)
  const qrCodeImage = await QRCode.toDataURL(content);  // Génère une image QR code en base64
  
  // Trouver le rendez-vous et ajouter les données QR
  const appointment = await Appointment.findByPk(appointmentId);
  
  if (appointment) {
    // Ajouter les données QR au champ JSON de qr_data
    appointment.qr_data = qrCodeData;

    // Sauvegarder le rendez-vous mis à jour avec les données QR
    await appointment.save();
  } else {
    
  }
}

exports = {generateQRCodeForAppointment};
