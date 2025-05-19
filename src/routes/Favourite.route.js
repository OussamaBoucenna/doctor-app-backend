const express = require('express');
const router = express.Router();
const FavoritesController = require('../controller/Favourite.controller');
const { authMiddleware, getPatient } = require('../middlewares/Auth');

// Get all favorite doctors for a patient
router.get('/', authMiddleware, getPatient, FavoritesController.getFavoriteDoctors);

// Add a doctor to favorites
router.post('/:doctorId', authMiddleware, getPatient, FavoritesController.addFavoriteDoctor);

// Remove a doctor from favorites
router.delete('/:doctorId', authMiddleware, getPatient, FavoritesController.removeFavoriteDoctor);

// Check if a doctor is in favorites
router.get('/check/:doctorId', authMiddleware, getPatient, FavoritesController.checkFavoriteStatus);

module.exports = router;