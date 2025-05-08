// routes/appointment.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controller/Appointment.controller');
const {authMiddleware,getDoctor} = require('../middlewares/Auth');

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/patient/',authMiddleware ,controller.getAppointmentsByPatientId);
//router.get('/doctor/:doctorId/next', controller.getNextAppointment);
router.get('/doctor/my-next-appointments', authMiddleware, getDoctor , controller.getNextAppointment);

router.get('/first-upcoming', authMiddleware, controller.getFirstUpcomingAppointmentByPatientId);
router.get('/:id', controller.getAppointment);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
