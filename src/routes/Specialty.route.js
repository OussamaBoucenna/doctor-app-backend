const express = require('express');
const router = express.Router();
const specialtyController = require('../controller/Specialty.controller');

// Route to get all specialties
router.get('/', specialtyController.getAllSpecialties);

// Route to get a specific specialty by ID
router.get('/:id', specialtyController.getSpecialtyById);

// Route to create a new specialty
router.post('/', specialtyController.createSpecialty);

// Route to update a specialty by ID
router.put('/:id', specialtyController.updateSpecialty);

// Route to delete a specialty by ID
router.delete('/:id', specialtyController.deleteSpecialty);

module.exports = router;
