const express = require('express');
const router = express.Router();
const reviewController = require('../controller/Review.controller');

router.get('/', reviewController.getAll);
router.get('/:id', reviewController.getOne);
router.get('/doctor/:doctor_id', reviewController.getReviewsByDoctor);
router.post('/', reviewController.create);
router.put('/:id', reviewController.update);
router.delete('/:id', reviewController.remove);

module.exports = router;
