const NotificationService = require('../service/Notification.service');

// Get all notifications for the current patient user
const getAllPatientNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const patientId = req.patientId;
    
    console.log('Getting notifications for patient:', patientId, 'with userId:', userId);
    
    if (!userId || !patientId) {
      return res.status(400).json({
        message: 'User ID and Patient ID are required'
      });
    }
    
    // Vérifier que l'utilisateur est bien un patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        message: 'Access forbidden. Only patients can access notifications.'
      });
    }
    
    const notifications = await NotificationService.getAllPatientNotifications(userId, patientId);
    
    res.status(200).json({
      message: 'Patient notifications retrieved successfully',
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching patient notifications:', error);
    res.status(500).json({
      message: 'Error fetching patient notifications',
      error: error.message
    });
  }
};


const createNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    
    console.log('Creating notification for user:', userId);
    
    if (!userId || !title || !message) {
      return res.status(400).json({
        message: 'User ID, title, and message are required'
      });
    }
    
    const notification = await NotificationService.createNotification(userId, { title, message });
    
    res.status(201).json({
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      message: 'Error creating notification',
      error: error.message
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    const updatedNotification = await NotificationService.markNotificationAsRead(notificationId);

    res.status(200).json({
      message: 'Notification marked as read',
      data: updatedNotification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};


module.exports = {
  getAllPatientNotifications,
  createNotification,
  markNotificationAsRead
};