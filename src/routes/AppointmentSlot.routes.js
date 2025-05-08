const express = require('express');
const appointmentSlotController = require('../controller/AppointmentSlot.controller');
const router = express.Router();

/**
 * @route GET /api/appointment-slots
 * @desc Get all appointment slots
 * @access Private
 */
router.get('/', appointmentSlotController.getAllSlots);

/**
 * @route GET /api/appointment-slots/:id
 * @desc Get appointment slot by ID
 * @access Private
 */
router.get('/:id', appointmentSlotController.getSlotById);

/**
 * @route GET /api/appointment-slots/doctor/:doctorId/date/:date
 * @desc Get available slots by doctor ID and date
 * @access Private
 */
router.get('/doctor/:doctorId/by-date', appointmentSlotController.getSlotsByDoctorIdAndDate);

/**
 * @route GET /api/appointment-slots/doctor/:doctorId
 * @desc Get available slots by doctor ID
 * @access Public
 */
router.get('/doctor/:doctorId', appointmentSlotController.getAvailableSlotsByDoctorId);



/**
 * @route GET /api/appointment-slots/schedule/:scheduleId
 * @desc Get slots by schedule ID
 * @access Private
 */
router.get('/schedule/:scheduleId', appointmentSlotController.getSlotsByScheduleId);

/**
 * @route POST /api/appointment-slots
 * @desc Create a single appointment slot
 * @access Private
 */
router.post('/', appointmentSlotController.createSlot);

/**
 * @route PUT /api/appointment-slots/:id
 * @desc Update an appointment slot
 * @access Private
 */
router.put('/:id', appointmentSlotController.updateSlot);

/**
 * @route DELETE /api/appointment-slots/:id
 * @desc Delete an appointment slot
 * @access Private
 */
router.delete('/:id', appointmentSlotController.deleteSlot);




module.exports = router;