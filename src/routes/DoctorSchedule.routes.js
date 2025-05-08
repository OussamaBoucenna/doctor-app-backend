const express = require('express');
const doctorScheduleController = require('../controller/DoctorSchedule.controller');
const router = express.Router();

/**
 * @route POST /api/doctor-schedules
 * @desc Create a new doctor schedule
 * @access Private
 */
router.post('/', doctorScheduleController.createSchedule);

/**
 * @route GET /api/doctor-schedules
 * @desc Get all doctor schedules
 * @access Private
 */
router.get('/', doctorScheduleController.getAllSchedules);

/**
 * @route GET /api/doctor-schedules/:id
 * @desc Get a doctor schedule by ID
 * @access Private
 */
router.get('/:id', doctorScheduleController.getScheduleById);

/**
 * @route GET /api/doctor-schedules/doctor/:doctorId
 * @desc Get schedules by doctor ID
 * @access Private
 */
router.get('/doctor/:doctorId', doctorScheduleController.getSchedulesByDoctorId);

/**
 * @route PUT /api/doctor-schedules/:id
 * @desc Update a doctor schedule
 * @access Private
 */
router.put('/:id', doctorScheduleController.updateSchedule);

/**
 * @route DELETE /api/doctor-schedules/:id
 * @desc Delete a doctor schedule
 * @access Private
 */
router.delete('/:id', doctorScheduleController.deleteSchedule);

module.exports = router;