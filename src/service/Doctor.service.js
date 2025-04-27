const Doctor = require('../model/Doctor.model');
const User = require('../model/User.model');

// Petite fonction pour traduire 'speciality' si besoin
function translateSpecialty(speciality) {
  switch (speciality) {
    case 'general':
      return 'General Practitioner';
    case 'dentist':
      return 'Dentist';
    case 'dermatologist':
      return 'Dermatologist';
    default:
      return speciality;
  }
}

async function getAllDoctors() {
  const doctors = await Doctor.findAll({
    include: [{
      model: User,
      attributes: ['user_id', 'first_name', 'last_name', 'email', 'phone', 'image']
    }]
  });

  return doctors.map(doctor => ({
    id: doctor.doctor_id,
    name: `${doctor.USER.first_name} ${doctor.USER.last_name}`,
    specialty: translateSpecialty(doctor.speciality),
    hospital: doctor.clinique_name || 'Unknown Clinic',
    rating: doctor.rating || 0,
    reviewCount: doctor.reviewCount || 0,
    yearsExperience: doctor.yearsExperience || 0,
    patientCount: doctor.patiens || 0,
    location: doctor.location || '',
    about: doctor.about || '',
    imageResId: doctor.USER.image || 'default_image.png',
    socialLinks: {
      facebook: doctor.facebook_link || '',
      instagram: doctor.instagram_link || '',
      tiktok: doctor.tiktok_link || ''
    }
  }));
}


const getDoctorById = async (id) => {
  return await Doctor.findByPk(id);
};

const updateDoctor = async (id, doctorData) => {
  const doctor = await Doctor.findByPk(id);
  if (!doctor) throw new Error('Doctor not found');
  return await doctor.update(doctorData);
};

const deleteDoctor = async (id) => {
  const doctor = await Doctor.findByPk(id);
  if (!doctor) throw new Error('Doctor not found');
  await doctor.destroy();
  return true;
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
};
