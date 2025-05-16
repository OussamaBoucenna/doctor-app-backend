const express = require('express');
const router = express.Router();
const qrCodeController = require('../controller/qrCodeData.controller');

// POST route to generate a QR code for an appointment
router.post('/generate-qrcode', qrCodeController.generateQRCode);
router.get('/:appointmentId', qrCodeController.getQRCodeForAppointment);

module.exports = router;
