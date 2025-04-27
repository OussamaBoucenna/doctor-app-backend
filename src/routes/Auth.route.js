const express = require('express');
const router = express.Router();
const upload = require('./../middlewares/Upload');
const authController = require('./../controller/Auth.controller');


router.post('/login', authController.login);
router.post('/register-patient',upload.single('image') ,authController.register);
router.post('/register-doctor',upload.single('image') ,authController.registerDoctor);


module.exports = router;