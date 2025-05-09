const express = require('express');
const router = express.Router();
const userController = require('./../controller/User.controller');
const {authMiddleware} = require('./../middlewares/Auth'); 

// Route protégée (avec auth) ou publique selon ton besoin
router.get('/current', authMiddleware, userController.getCurrentUser);
router.get('/currentPatient', authMiddleware, userController.getUserPatienById);

module.exports = router;
