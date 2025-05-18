const FavoriteDoctor = require('../model/FavoriteDoctor.model');
const Doctor = require('../model/Doctor.model');
const User = require('../model/User.model');
const Specialty = require('../model/Specialty.model');

const getFavoriteDoctors = async (patientId) => {
  try {
    console.log('Service: Getting favorite doctors for patient:', patientId);
    
    // Get all favorite relationships for this patient
    const favorites = await FavoriteDoctor.findAll({
      where: {
        patient_id: patientId
      },
      include: [
        {
          model: Doctor,
          include: [
            {
              model: User,
              attributes: ['first_name', 'last_name', 'email', 'image']
            },
            {
              model: Specialty,
              attributes: ['name'] // ONLY request 'name', NOT 'description'
            }
          ]
        }
      ]
    });
    
    console.log('Favorites found:', favorites?.length || 0);
    
    // Format the response with only the requested fields
    const formattedFavorites = favorites.map(favorite => {
      const doctor = favorite.DOCTOR;
      const user = doctor.USER;
      const specialty = doctor.SPECIALTY;
      
      return {
        doctor_id: doctor.doctor_id,
        name: `${user.first_name} ${user.last_name}`,
        image: user.image,
        clinique_name: doctor.clinique_name,
        specialty: specialty ? specialty.name : null,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount
      };
    });
    
    return formattedFavorites;
  } catch (error) {
    console.error('Error fetching favorite doctors:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Unable to fetch favorite doctors: ${error.message}`);
  }
};

// Add a doctor to favorites
const addFavoriteDoctor = async (patientId, doctorId) => {
  try {
    console.log('Service: Adding doctor to favorites:', { patientId, doctorId });

    // Check if the doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Check if the favorite relationship already exists
    const existingFavorite = await FavoriteDoctor.findOne({
      where: {
        patient_id: patientId,
        doctor_id: doctorId
      }
    });

    if (existingFavorite) {
      throw new Error('Doctor is already in favorites');
    }

    // Create the favorite relationship
    const favorite = await FavoriteDoctor.create({
      patient_id: patientId,
      doctor_id: doctorId
    });

    console.log('Favorite created successfully:', favorite);
    return {
      patient_id: patientId,
      doctor_id: doctorId,
      created_at: new Date()
    };
  } catch (error) {
    console.error('Error adding favorite doctor:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Unable to add doctor to favorites: ${error.message}`);
  }
};

// Remove a doctor from favorites
const removeFavoriteDoctor = async (patientId, doctorId) => {
  try {
    console.log('Service: Removing doctor from favorites:', { patientId, doctorId });

    // Find and delete the favorite relationship
    const deleted = await FavoriteDoctor.destroy({
      where: {
        patient_id: patientId,
        doctor_id: doctorId
      }
    });

    console.log('Favorite deleted:', deleted > 0);
    return deleted > 0; // Returns true if successfully deleted, false if not found
  } catch (error) {
    console.error('Error removing favorite doctor:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Unable to remove doctor from favorites: ${error.message}`);
  }
};

// Check if a doctor is in favorites
const checkFavoriteStatus = async (patientId, doctorId) => {
  try {
    console.log('Service: Checking favorite status:', { patientId, doctorId });

    // Check if the favorite relationship exists
    const favorite = await FavoriteDoctor.findOne({
      where: {
        patient_id: patientId,
        doctor_id: doctorId
      }
    });

    const isFavorite = !!favorite;
    console.log('Is favorite:', isFavorite);
    return isFavorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Unable to check favorite status: ${error.message}`);
  }
};

module.exports = {
  getFavoriteDoctors,
  addFavoriteDoctor,
  removeFavoriteDoctor,
  checkFavoriteStatus
};