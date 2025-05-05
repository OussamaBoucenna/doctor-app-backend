// routes/DoctorSchedule.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controller/DoctorSchedule.controller');

router.post('/', controller.createSchedule);
router.get('/', controller.getAllSchedules);
router.get('/:id', controller.getScheduleById);
router.put('/:id', controller.updateSchedule);
router.delete('/:id', controller.deleteSchedule);

module.exports = router;
