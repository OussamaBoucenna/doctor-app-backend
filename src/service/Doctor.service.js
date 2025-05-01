const Doctor = require('../model/Doctor.model');
const User = require('../model/User.model');
const Specialty = require('../model/Specialty.model');

// Function to fetch all doctors with their details
async function getAllDoctors() {
  try {
    // Fetch all specialties
    const specialties = await Specialty.findAll();

    // Create a mapping for specialty id to specialty name
    const specialtyMap = specialties.reduce((acc, specialty) => {
      acc[specialty.specialty_id] = specialty.name;
      return acc;
    }, {});

    // Fetch all doctors with their associated user information
    const doctors = await Doctor.findAll({
      include: [{
        model: User,
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'phone', 'image']
      }]
    });

    // Map doctors to a structured response
    return doctors.map(doctor => {
      const user = doctor.USER; // Get the user related to the doctor
      if (!user) {
        console.warn(`Doctor with ID ${doctor.doctor_id} does not have a related user`);
      }

      return {
        id: doctor.doctor_id,
        name: `${user.first_name} ${user.last_name}`,
        specialty: specialties[0] || 'Unknown Specialty', // Map specialty ID to name
        hospital: doctor.clinique_name || 'Unknown Clinic',
        rating: doctor.rating || 0,
        reviewCount: doctor.reviewCount || 0,
        yearsExperience: doctor.yearsExperience || 0,
        patientCount: doctor.patiens || 0,
        location: doctor.location || 'Unknown Location',
        about: doctor.about || 'No information available',
        imageUrl: user.image || 'default_image.png', // Use the user's image or a default one
        socialLinks: {
          facebook: doctor.facebook_link || '',
          instagram: doctor.instagram_link || '',
          tiktok: doctor.tiktok_link || ''
        }
      };
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw new Error('Unable to fetch doctors');
  }
}

// Function to fetch a single doctor by ID
const getDoctorById = async (id) => {
  try {
    const doctor = await Doctor.findByPk(id, {
      include: [{
        model: User,
        attributes: ['user_id', 'first_name', 'last_name', 'email', 'phone', 'image']
      }]
    });

    if (!doctor) {
      throw new Error(`Doctor with ID ${id} not found`);
    }

    const user = doctor.USER;

    const specialties = await Specialty.findAll();
    const specialtyMap = specialties.reduce((acc, specialty) => {
      acc[specialty.specialty_id] = {
        id: specialty.specialty_id,
        name: specialty.name
      };
      return acc;
    }, {});

    return {
      id: doctor.doctor_id,
      name: `${user.first_name} ${user.last_name}`,
      specialty: specialtyMap[doctor.specialty_id] || { id: doctor.specialty_id, name: 'Unknown Specialty' },
      hospital: doctor.clinique_name || 'Unknown Clinic',
      rating: doctor.rating || 0,
      reviewCount: doctor.reviewCount || 0,
      yearsExperience: doctor.yearsExperience || 0,
      patients: doctor.patiens || 0,
      hospitalLocation: doctor.location || 'Unknown Location',
      about: doctor.about || 'No information available',
      imageUrl: user.image || 'default_image.png', // <<< correction ici
      socialLinks: {
        facebook: doctor.facebook_link || '',
        instagram: doctor.instagram_link || '',
        tiktok: doctor.tiktok_link || ''
      }
    };
  } catch (error) {
    console.error(`Error fetching doctor with ID ${id}:`, error);
    throw new Error(`Unable to fetch doctor with ID ${id}`);
  }
};



// Function to update a doctor's details
const updateDoctor = async (id, doctorData) => {
  try {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) throw new Error('Doctor not found');
    return await doctor.update(doctorData);
  } catch (error) {
    console.error(`Error updating doctor with ID ${id}:`, error);
    throw new Error(`Unable to update doctor with ID ${id}`);
  }
};

// Function to delete a doctor
const deleteDoctor = async (id) => {
  try {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) throw new Error('Doctor not found');
    await doctor.destroy();
    return { message: 'Doctor deleted successfully' };
  } catch (error) {
    console.error(`Error deleting doctor with ID ${id}:`, error);
    throw new Error(`Unable to delete doctor with ID ${id}`);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
};
