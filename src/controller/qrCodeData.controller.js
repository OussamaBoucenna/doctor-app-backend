const qrCodeService = require('../service/qrCodeData.service'); // Your service file

// Controller to generate QR code for an appointment
const generateQRCode = async (req, res) => {
  try {
    const { appointmentId, content } = req.body;

    if (!appointmentId || !content) {
      return res.status(400).json({ message: 'appointmentId and content are required' });
    }

    await qrCodeService.generateQRCodeForAppointment(appointmentId, content);

    return res.status(200).json({ message: 'QR Code generated and saved successfully' });
  } catch (error) {
    console.error('Error generating QR Code:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  generateQRCode
};
