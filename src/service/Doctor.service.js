const Doctor = require('../model/Doctor.model');
const User = require('../model/User.model');
const Specialty = require('../model/Specialty.model');
const Appointment = require('../model/Appointment.model');
const DoctorSchedule = require('../model/DoctorSchedule.model');
const AppointmentSlot = require('../model/AppointmentSlot.model');
const Patient = require('../model/Patient.model');

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
        return null; // Skip this doctor if no user is associated
      }

      return {
        id: doctor.doctor_id,
        name: `${user.first_name} ${user.last_name}`,
        specialty: specialties[0] || 'Unknown Specialty', // Fixed: use doctor's specialty_id
        hospital: doctor.clinique_name || 'Unknown Clinic',
        rating: doctor.rating || 0,
        reviewCount: doctor.reviewCount || 0,
        yearsExperience: doctor.yearsExperience || 0,
        patientCount: doctor.patiens || 0,
        location: doctor.location || 'Unknown Location',
        about: doctor.about || 'No information available',
        imageUrl: user.image,
        socialLinks: {
          facebook: doctor.facebook_link || '',
          instagram: doctor.instagram_link || '',
          tiktok: doctor.tiktok_link || ''
        }
      };
    }).filter(Boolean); // Remove null entries
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
    if (!user) {
      throw new Error(`No user associated with doctor ID ${id}`);
    }

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
      imageUrl: user.image,
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

const getAppointmentsByDate = async (doctorId, date) => {
  try {
    console.log('Service: Getting appointments for doctor:', doctorId, 'on date:', date);
    
    // First, get the doctor's schedule for the given date
    const schedule = await DoctorSchedule.findOne({
      where: {
        doctor_id: doctorId,
        working_date: date,
      }
    });

    console.log('Schedule found:', schedule.schedule_id);

    if (!schedule) {
      console.log('No schedule found for doctor on this date');
      return []; // Return empty array instead of throwing error
    }

    // Get all appointment slots for this schedule
    const appointmentSlots = await AppointmentSlot.findAll({
      where: {
        schedule_id: schedule.schedule_id,
        working_date: date,
      }
    });

    console.log('Appointment slots found:', appointmentSlots?.length || 0);

    if (!appointmentSlots || appointmentSlots.length === 0) {
      console.log('No appointment slots found');
      return []; // Return empty array if no slots
    }

    // Get all slot IDs
    const slotIds = appointmentSlots.map(slot => slot.slot_id);
    console.log('Slot IDs:', slotIds);

    // Get all appointments for these slots
    const appointments = await Appointment.findAll({
      where: {
        slot_id: slotIds,
      },
      include: [
        {
          model: AppointmentSlot,
          // Remove the alias since it's not defined in your associations
          include: [
            {
              model: DoctorSchedule,
              // Remove the alias since it's not defined in your associations
              include: [
                {
                  model: Doctor,
                  // Remove the alias since it's not defined in your associations
                  include: [
                    {
                      model: User,
                      // Remove the alias since it's not defined in your associations
                      attributes: ['first_name', 'last_name', 'email']
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: Patient,
          // Remove the alias since it's not defined in your associations
          include: [
            {
              model: User,
              // Remove the alias since it's not defined in your associations
              attributes: ['first_name', 'last_name', 'email', 'phone']
            }
          ]
        }
      ]
    });

    console.log('Appointments found:', appointments?.length || 0);

    // Format the response with correct property names (no aliases)
    const formattedAppointments = appointments.map(appointment => {
      console.log('Processing appointment:', appointment.appointment_id);
      
      // Get slot info safely - use APPOINTMENT_SLOT (model name) instead of alias
      const slotInfo = appointment.APPOINTMENT_SLOT ? {
        start_time: appointment.APPOINTMENT_SLOT.start_time,
        end_time: appointment.APPOINTMENT_SLOT.end_time,
        working_date: appointment.APPOINTMENT_SLOT.working_date,
        is_booked: appointment.APPOINTMENT_SLOT.is_book
      } : {};

      // Get patient info safely - use PATIENT (model name) instead of alias
      const patientInfo = appointment.PATIENT && appointment.PATIENT.USER ? {
        name: `${appointment.PATIENT.USER.first_name} ${appointment.PATIENT.USER.last_name}`,
        email: appointment.PATIENT.USER.email,
        phone: appointment.PATIENT.USER.phone,
      } : null;

      // Get doctor info safely - use DOCTOR_SCHEDULE (model name) instead of alias
      let doctorInfo = { doctor_id: doctorId };
      if (appointment.APPOINTMENT_SLOT && 
          appointment.APPOINTMENT_SLOT.DOCTOR_SCHEDULE && 
          appointment.APPOINTMENT_SLOT.DOCTOR_SCHEDULE.DOCTOR && 
          appointment.APPOINTMENT_SLOT.DOCTOR_SCHEDULE.DOCTOR.USER) {
        doctorInfo.name = `${appointment.APPOINTMENT_SLOT.DOCTOR_SCHEDULE.DOCTOR.USER.first_name} ${appointment.APPOINTMENT_SLOT.DOCTOR_SCHEDULE.DOCTOR.USER.last_name}`;
      } else {
        doctorInfo.name = 'Doctor Name Not Available';
      }

      return {
        appointment_id: appointment.appointment_id,
        slot_id: appointment.slot_id,
        patient_id: appointment.patient_id,
        status: appointment.status,
        reason: appointment.reason,
        // qr_data: appointment.qr_data,
        slot_info: slotInfo,
        patient_info: patientInfo,
        doctor_info: doctorInfo
      };
    });

    console.log('Formatted appointments count:', formattedAppointments.length);
    return formattedAppointments;
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    console.error('Error stack:', error.stack);
    
    // Re-throw with more specific error info
    throw new Error(`Unable to fetch appointments: ${error.message}`);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getAppointmentsByDate
};