const qrCodeService = require('../service/qrCodeData.service'); // Your service file

// Controller to generate QR code for an appointment
const generateQRCode = async (req, res) => {
  try {
    const { appointmentId, content } = req.body;

    if (!appointmentId || !content) {
      return res.status(400).json({ message: 'appointmentId and content are required' });
    }

    const qrImage = await qrCodeService.generateQRCodeForAppointment(appointmentId, content);

    res.status(200).json({
      message: 'QR Code generated successfully',
      qrCodeImage: qrImage // base64 image
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR Code', error: error.message });
  }
};

const getQRCodeForAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const qrData = await qrCodeService.getQRCodeForAppointment(appointmentId);
    return res.json(qrData);
  } catch (error) {
    console.error('Error retrieving QR code:', error.message);
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      message: error.message || 'Internal server error',
    });
  }
};

module.exports = {
  generateQRCode,
  getQRCodeForAppointment
};
