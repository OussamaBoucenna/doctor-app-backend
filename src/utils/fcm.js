// utils/fcm.js

const admin = require("firebase-admin");
const  FCM  = require("../model/Fcm.model"); // adapte selon l'emplacement de ton modèle

// Initialisation Firebase Admin (une seule fois dans ton projet)
const serviceAccount = require("./../../serviceFCM.json");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Fonction pour envoyer une notification à un utilisateur
async function sendNotificationToUser(userId, title, body) {
    console.log("sendNotificationToUser called with:", { userId, title, body });
  try {
    if (!userId || !title || !body) {
      throw new Error("Données manquantes (userId, title, body requis)");
    }

    const fcmRecord = await FCM.findOne({ where: { user_id: userId } });

    if (!fcmRecord || !fcmRecord.token) {
      throw new Error("Token FCM non trouvé pour cet utilisateur");
    }

    const message = {
      notification: { title, body },
      token: fcmRecord.token,
    };

    const response = await admin.messaging().send(message);
    console.log("Notification envoyée avec succès:", response);
    return response;

  } catch (err) {
    console.error("Erreur lors de l'envoi de la notification:", err);
    throw err;
  }
}

module.exports = { sendNotificationToUser };
