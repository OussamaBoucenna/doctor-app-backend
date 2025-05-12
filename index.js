const express = require('express');
const cors = require('cors');
const admin = require("firebase-admin");

const { sequelize } = require('./src/config/config'); 
const User = require('./src/model/User.model');
const FCM = require('./src/model/Fcm.model');
const authRoutes = require('./src/routes/Auth.route');
const userRoutes = require('./src/routes/User.route');
const doctorRoutes = require('./src/routes/Doctor.route');
const prescriptionRoutes = require('./src/routes/Prescription.route');

const specialtyRoutes = require('./src/routes/Specialty.route');
const reviewRoutes = require('./src/routes/Review.routes');
const doctorScheduleRoutes = require('./src/routes/DoctorSchedule.routes');
const appointmentSlotRoutes = require('./src/routes/AppointmentSlot.routes');
const appointmentRoutes = require('./src/routes/Appointment.routes');
const qrCodeRoutes = require('./src/routes/qrCodeData.routes');
const FcmRoutes = require('./src/routes/Fcm.route');

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/prescriptions',prescriptionRoutes);


app.use('/api/specialties', specialtyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/doctor-schedules', doctorScheduleRoutes);
app.use('/api/appointment-slots', appointmentSlotRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/qrcode', qrCodeRoutes);
app.use('/api/fcm',FcmRoutes)


app.get('/users/:id/image', async (req, res) => {
    const userId = req.params.id;
  
    try {
      const user = await User.findByPk(userId);
  
      if (!user || !user.image) {
        return res.status(404).send('Image non trouvée');
      }
  
      // Ici on suppose que c'est une image JPEG (tu peux détecter le type avec un champ séparé si tu veux)
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(user.image);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur serveur');
    }
  });




  // Initialisation Firebase Admin
const serviceAccount = require("./serviceFCM.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


// Route pour envoyer une notification à un utilisateur
app.post("/api/notify-user", async (req, res) => {
  try {
    const { userId, title, body } = req.body;
    
    // Vérifier si tous les champs requis sont présents
    if (!userId || !title || !body) {
      return res.status(400).json({ error: "Données manquantes (userId, title, body requis)" });
    }
    
    // Rechercher le token FCM de l'utilisateur dans la base de données
    const fcmRecord = await FCM.findOne({ where: { user_id: userId } });
    
    // Vérifier si un token existe pour cet utilisateur
    if (!fcmRecord || !fcmRecord.token) {
      return res.status(404).json({ error: "Token FCM non trouvé pour cet utilisateur" });
    }
    
    // Préparer le message de notification
    const message = {
      notification: { 
        title, 
        body 
      },
      token: fcmRecord.token,
    };
    
    // Envoyer la notification via Firebase
    const response = await admin.messaging().send(message);
    console.log("Notification envoyée avec succès:", response);
    
    return res.status(200).json({ 
      message: "Notification envoyée avec succès", 
      response: response 
    });
    
  } catch (err) {
    console.error("Erreur lors de l'envoi de la notification:", err);
    return res.status(500).json({ 
      error: "Erreur lors de l'envoi de la notification", 
      details: err.message 
    });
  }
});

sequelize.authenticate()
    .then(() => {
        return sequelize.sync({ force: false  }); 
    })
    .then(() => {
        app.listen(PORT,'0.0.0.0', () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error initializing the database or server:", error);
    });

