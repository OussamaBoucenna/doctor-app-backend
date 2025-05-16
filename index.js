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

