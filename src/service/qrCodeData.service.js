const QRCode = require('qrcode');  // Pour générer le QR code (package npm)
const moment = require('moment');
const Appointment = require('../model/Appointment.model');  // Import du modèle Appointment
const QRCodeData = require('../model/qrCodeData.model'); 

// Fonction pour générer et ajouter un QR code
async function generateQRCodeForAppointment(appointmentId, content) {
  try {
    const timestamp = moment().unix(); // Current time in seconds

    // Build the payload to encode in the QR code
    const qrPayload = {
      appointmentId: appointmentId.toString(),
      content,
      timestamp
    };

    // Convert payload to string and generate QR code image (base64)
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrPayload));

    // Find appointment by ID
    const appointment = await Appointment.findByPk(appointmentId);

    if (!appointment) {
      throw new Error(`Appointment with ID ${appointmentId} not found`);
    }

    // Store QR data in the appointment (as JSON)
    appointment.qr_data = {
      ...qrPayload,
      image: qrCodeImage // optional: store base64 image
    };

    await appointment.save();

    // Optional: store in QRCodeData table (if you're using it)
    await QRCodeData.create({
      id: appointmentId.toString(),
      content,
      timestamp
    });

    return qrCodeImage;

  } catch (error) {
    console.error('Error generating QR code for appointment:', error);
    throw error;
  }
}

const getQRCodeForAppointment = async (appointmentId) => {
  console.log('Fetching QR code for appointment ID:', appointmentId);
  // Étape 1 : Chercher le rendez-vous
  const appointment = await Appointment.findByPk(appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found');
  }
  console.log('Appointment found:', appointment);
  // Étape 2 : Vérifier si le QR est stocké directement dans le champ qr_data
  if (appointment.qr_data) {
    return {
      id: appointmentId,
      content: appointment.qr_data.content,
      timestamp: appointment.qr_data.timestamp,
      image: appointment.qr_data.image,
    };
  }

  // Étape 3 : Sinon, récupérer depuis la table QRCodeData
  const qrCodeRecord = await QRCodeData.findOne({ where: { id: appointmentId } });

  if (qrCodeRecord) {
    // Image non stockée, mais on peut la régénérer à la volée
    const qrPayload = {
      appointmentId: qrCodeRecord.id,
      content: qrCodeRecord.content,
      timestamp: qrCodeRecord.timestamp
    };

    const qrImage = await QRCode.toDataURL(JSON.stringify(qrPayload));

    return {
      id: qrCodeRecord.id,
      content: qrCodeRecord.content,
      timestamp: qrCodeRecord.timestamp,
      image: qrImage,
    };
  }

  throw new Error('QR code data not found for this appointment');
};


module.exports = {
                  generateQRCodeForAppointment,
                  getQRCodeForAppointment
                };
