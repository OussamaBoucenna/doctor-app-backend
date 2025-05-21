const express = require('express');
const router = express.Router();
const { authMiddleware, getPatient } = require('../middlewares/Auth');
const NotificationController = require('../controller/Notification.controller');

// Get all notifications for the current authenticated patient
router.get('/', authMiddleware, getPatient, NotificationController.getAllPatientNotifications);


router.post('/create', NotificationController.createNotification);
router.post('/:notificationId/read', authMiddleware, NotificationController.markNotificationAsRead);


module.exports = router;