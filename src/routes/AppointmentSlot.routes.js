const express = require('express');
const router = express.Router();
const controller = require('../controller/AppointmentSlot.controller'); 

router.post('/', controller.createSlot);
router.get('/', controller.getAllSlots);
router.get('/:id', controller.getSlotById);
router.put('/:id', controller.updateSlot);
router.delete('/:id', controller.deleteSlot);

module.exports = router;
