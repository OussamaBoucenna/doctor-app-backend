const express = require('express');
const router = express.Router();
const upload = require('./../middlewares/Upload');
const authController = require('./../controller/Auth.controller');


router.post('/login', authController.login);
router.post('/register',upload.single('image') ,authController.register);

module.exports = router;