const FavoritesService = require('../service/Favourite.service');

// Get all favorite doctors for a patient
const getFavoriteDoctors = async (req, res) => {
  try {
    const patientId = req.patientId;

    console.log('Getting favorite doctors for patient:', patientId);

    if (!patientId) {
      return res.status(400).json({
        message: 'Patient ID is required'
      });
    }

    const favoriteDoctors = await FavoritesService.getFavoriteDoctors(patientId);

    res.status(200).json({
      message: 'Favorite doctors retrieved successfully',
      data: favoriteDoctors,
      count: favoriteDoctors.length
    });
  } catch (error) {
    console.error('Error fetching favorite doctors:', error);
    res.status(500).json({
      message: 'Error fetching favorite doctors',
      error: error.message
    });
  }
};

// Add a doctor to favorites
const addFavoriteDoctor = async (req, res) => {
  try {
    const patientId = req.patientId;
    const doctorId = req.params.doctorId;

    console.log('Adding doctor to favorites:', { patientId, doctorId });

    if (!patientId || !doctorId) {
      return res.status(400).json({
        message: 'Both patient ID and doctor ID are required',
        received: { patientId, doctorId }
      });
    }

    // Validate doctor ID is a number
    if (isNaN(parseInt(doctorId))) {
      return res.status(400).json({
        message: 'Invalid doctor ID format'
      });
    }

    const result = await FavoritesService.addFavoriteDoctor(patientId, parseInt(doctorId));

    res.status(200).json({
      message: 'Doctor added to favorites successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding favorite doctor:', error);
    
    // Handle specific error types
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        message: 'Doctor is already in favorites',
        error: error.message
      });
    }
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        message: 'Doctor not found',
        error: error.message
      });
    }

    res.status(500).json({
      message: 'Error adding doctor to favorites',
      error: error.message
    });
  }
};

// Remove a doctor from favorites
const removeFavoriteDoctor = async (req, res) => {
  try {
    const patientId = req.patientId;
    const doctorId = req.params.doctorId;

    console.log('Removing doctor from favorites:', { patientId, doctorId });

    if (!patientId || !doctorId) {
      return res.status(400).json({
        message: 'Both patient ID and doctor ID are required',
        received: { patientId, doctorId }
      });
    }

    // Validate doctor ID is a number
    if (isNaN(parseInt(doctorId))) {
      return res.status(400).json({
        message: 'Invalid doctor ID format'
      });
    }

    const result = await FavoritesService.removeFavoriteDoctor(patientId, parseInt(doctorId));

    if (!result) {
      return res.status(404).json({
        message: 'Favorite relationship not found'
      });
    }

    res.status(200).json({
      message: 'Doctor removed from favorites successfully'
    });
  } catch (error) {
    console.error('Error removing favorite doctor:', error);
    res.status(500).json({
      message: 'Error removing doctor from favorites',
      error: error.message
    });
  }
};

// Check if a doctor is in favorites
const checkFavoriteStatus = async (req, res) => {
  try {
    const patientId = req.patientId;
    const doctorId = req.params.doctorId;

    console.log('Checking favorite status:', { patientId, doctorId });

    if (!patientId || !doctorId) {
      return res.status(400).json({
        message: 'Both patient ID and doctor ID are required',
        received: { patientId, doctorId }
      });
    }

    // Validate doctor ID is a number
    if (isNaN(parseInt(doctorId))) {
      return res.status(400).json({
        message: 'Invalid doctor ID format'
      });
    }

    const isFavorite = await FavoritesService.checkFavoriteStatus(patientId, parseInt(doctorId));

    res.status(200).json({
      message: 'Favorite status checked successfully',
      data: {
        isFavorite,
        patientId,
        doctorId: parseInt(doctorId)
      }
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({
      message: 'Error checking favorite status',
      error: error.message
    });
  }
};

module.exports = {
  getFavoriteDoctors,
  addFavoriteDoctor,
  removeFavoriteDoctor,
  checkFavoriteStatus
};