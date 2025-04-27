const express = require('express');
const router = express.Router();
const DoctorController = require('../controller/Doctor.controller');
  // Assurez-vous d'importer les modèles correctement
// Route pour récupérer tous les docteurs
// router.get('/all', async (req, res) => {
//   try {
//     const doctors = await Doctor.findAll({
//       include: [{
//         model: User,
//       }],
//     });

//     const doctorsList = doctors.map(doctor => ({
//       id: doctor.doctor_id,  // Correspond à id dans la DataClass
//       name: `${doctor.User.first_name} ${doctor.User.last_name}`,  // Construction du nom complet
//       specialty: doctor.speciality,  // spécialité
//       hospital: doctor.clinique_name,  // nom de l'hôpital/clinique
//       rating: doctor.rating,  // note
//       reviewCount: doctor.reviewCount,  // nombre de critiques
//       imageUrl: doctor.User.image || null,  // Vous pouvez ajouter l'image de l'utilisateur ou une valeur par défaut
//       about: doctor.about,  // Informations supplémentaires sur le docteur
//       yearsExperience: doctor.yearsExperience,  // Nombre d'années d'expérience
//       hospitalLocation: doctor.location,  // Localisation de l'hôpital
//       patients: doctor.patiens,  // Nombre de patients traités
//       workingHours: "10h - 16h",  // Horaires de travail (s'il existe)
//     }));

//     return res.status(200).json(doctorsList);
//   } catch (err) {
//     console.error('Error fetching doctors:', err);
//     return res.status(500).json({ error: 'An error occurred while fetching doctors' });
//   }
// });

// module.exports = router;



// Get all doctors
router.get('/', DoctorController.getAllDoctors);

// Get doctor by ID
router.get('/:id', DoctorController.getDoctorById);

// Update doctor
router.put('/:id', DoctorController.updateDoctor);

// Delete doctor
router.delete('/:id', DoctorController.deleteDoctor);

module.exports = router;