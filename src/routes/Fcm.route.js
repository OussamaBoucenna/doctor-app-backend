// routes/appointment.routes.js
const express = require('express');
const router = express.Router();
const {registerToken,logout} = require('./../controller/Fcm.controller');
const {authMiddleware,getDoctor} = require('../middlewares/Auth');

router.post('/register-token', registerToken);
router.get('/logout',authMiddleware,logout)


module.exports = router;
