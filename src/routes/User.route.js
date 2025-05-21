const express = require('express');
const router = express.Router();
const userController = require('./../controller/User.controller');
const authMiddleware = require('./../middlewares/Auth'); 
const upload = require('./../middlewares/Upload');
// Route protégée (avec auth) ou publique selon ton besoin
router.get('/current', authMiddleware, userController.getCurrentUser);
router.get('/currentPatient', authMiddleware, userController.getUserPatienById);

//edit patient profile
router.put('/editProfile', authMiddleware,upload.single('image'), userController.updateUserPatientById);


module.exports = router;
