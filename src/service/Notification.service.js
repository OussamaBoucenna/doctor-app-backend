const Notification = require('../model/Notification.model');
const User = require('../model/User.model');

const getAllPatientNotifications = async (userId, patientId) => {
  try {
    console.log('Service: Getting all notifications for patient:', patientId, 'with userId:', userId);
    
    const notifications = await Notification.findAll({
      where: {
        user_id: userId
      },
      order: [['createdAt', 'DESC']] // Les plus récentes en premier
    });
    
    console.log('Notifications found:', notifications?.length || 0);
    
    const formattedNotifications = notifications.map(notification => {
      return {
        notification_id: notification.notification_id,
        title: notification.title,
        message: notification.message,
        is_read: notification.is_read,
        created_at: notification.createdAt
      };
    });
    
    return formattedNotifications;
  } catch (error) {
    console.error('Error fetching patient notifications:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Unable to fetch patient notifications: ${error.message}`);
  }
};



const createNotification = async (userId, notificationData) => {
  try {
    console.log('Service: Creating notification for user:', userId);
    
    // Vérifier que l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Créer la notification
    const notification = await Notification.create({
      user_id: userId,
      title: notificationData.title,
      message: notificationData.message,
      is_read: false // Par défaut, les nouvelles notifications ne sont pas lues
    });
    
    console.log('Notification created with ID:', notification.notification_id);
    
    return {
      notification_id: notification.notification_id,
      title: notification.title,
      message: notification.message,
      is_read: notification.is_read,
      created_at: notification.createdAt
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Unable to create notification: ${error.message}`);
  }
};

module.exports = {
  getAllPatientNotifications,
  createNotification
};