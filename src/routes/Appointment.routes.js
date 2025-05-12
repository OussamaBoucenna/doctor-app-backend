// routes/appointment.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controller/Appointment.controller');
const {authMiddleware,getDoctor} = require('../middlewares/Auth');

router.post('/',authMiddleware, controller.create);
router.get('/', controller.getAll);
router.get('/patient/',authMiddleware ,controller.getAppointmentsByPatientId);
router.get('/doctor/my-next-appointments', authMiddleware, getDoctor , controller.getNextAppointment);
router.get('/first-upcoming', authMiddleware, controller.getFirstUpcomingAppointmentByPatientId);
router.get('/appointment/:appointmentId', controller.getAppointmentDetails);
router.patch('/cancel/:appointment_id', controller.cancelAppointment);
router.get('/:id', controller.getAppointment);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
