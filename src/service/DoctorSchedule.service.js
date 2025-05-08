const DoctorSchedule = require('../model/DoctorSchedule.model');
const AppointmentSlot = require('../model/AppointmentSlot.model');

const doctorScheduleService = {
  /**
   * Create a new doctor schedule and generate slots
   * @param {Object} scheduleData - Doctor schedule data
   * @returns {Object} New doctor schedule with generated slots
   */
  createSchedule: async (scheduleData) => {
    try {
      // Create the doctor schedule
      const newSchedule = await DoctorSchedule.create(scheduleData);
      
      // Generate appointment slots based on the schedule
      await generateAppointmentSlots(newSchedule);
      
      // Return the schedule with associated slots
      return await DoctorSchedule.findByPk(newSchedule.schedule_id, {
        include: [AppointmentSlot]
      });
    } catch (error) {
      console.error('Error in createSchedule service:', error);
      throw error;
    }
  },

  /**
   * Get all doctor schedules
   * @returns {Array} List of doctor schedules
   */
  getAllSchedules: async () => {
    try {
      return await DoctorSchedule.findAll({ 
        include: [AppointmentSlot] 
      });
    } catch (error) {
      console.error('Error in getAllSchedules service:', error);
      throw error;
    }
  },

  /**
   * Get a doctor schedule by ID
   * @param {Number} scheduleId - Schedule ID
   * @returns {Object} Doctor schedule
   */
  getScheduleById: async (scheduleId) => {
    try {
      return await DoctorSchedule.findByPk(scheduleId, {
        include: [AppointmentSlot]
      });
    } catch (error) {
      console.error('Error in getScheduleById service:', error);
      throw error;
    }
  },

  /**
   * Get schedules by doctor ID
   * @param {Number} doctorId - Doctor ID
   * @returns {Array} List of doctor schedules
   */
  getSchedulesByDoctorId: async (doctorId) => {
    try {
      return await DoctorSchedule.findAll({
        where: { doctor_id: doctorId },
        include: [AppointmentSlot]
      });
    } catch (error) {
      console.error('Error in getSchedulesByDoctorId service:', error);
      throw error;
    }
  },

  /**
   * Update a doctor schedule
   * @param {Number} scheduleId - Schedule ID
   * @param {Object} scheduleData - Updated schedule data
   * @returns {Object} Updated doctor schedule
   */
  updateSchedule: async (scheduleId, scheduleData) => {
    try {
      const schedule = await DoctorSchedule.findByPk(scheduleId);
      
      if (!schedule) {
        return null;
      }
      
      // Check if there are any booked appointments for this schedule
      const bookedSlots = await AppointmentSlot.findOne({
        where: { 
          schedule_id: scheduleId,
          is_book: true 
        }
      });
      
      if (bookedSlots) {
        throw new Error('Cannot update schedule with booked appointments');
      }
      
      // Update the schedule
      await schedule.update(scheduleData);
      
      // Delete existing slots
      await AppointmentSlot.destroy({
        where: { schedule_id: scheduleId }
      });
      
      // Regenerate slots based on the updated schedule
      await generateAppointmentSlots(schedule);
      
      // Return the updated schedule with new slots
      return await DoctorSchedule.findByPk(scheduleId, {
        include: [AppointmentSlot]
      });
    } catch (error) {
      console.error('Error in updateSchedule service:', error);
      throw error;
    }
  },

  /**
   * Delete a doctor schedule
   * @param {Number} scheduleId - Schedule ID
   * @returns {Boolean} True if deleted, false if not found
   */
  deleteSchedule: async (scheduleId) => {
    try {
      const schedule = await DoctorSchedule.findByPk(scheduleId);
      
      if (!schedule) {
        return false;
      }
      
      // Check if there are any booked appointments for this schedule
      const bookedSlots = await AppointmentSlot.findOne({
        where: {
          schedule_id: scheduleId,
          is_book: true
        }
      });
      
      if (bookedSlots) {
        throw new Error('Cannot delete schedule with booked appointments');
      }
      
      // Delete all slots associated with this schedule
      await AppointmentSlot.destroy({
        where: { schedule_id: scheduleId }
      });
      
      // Delete the schedule
      await schedule.destroy();
      
      return true;
    } catch (error) {
      console.error('Error in deleteSchedule service:', error);
      throw error;
    }
  }
};

/**
 * Helper function to generate appointment slots for a schedule
 * @param {Object} schedule - Doctor schedule
 */
async function generateAppointmentSlots(schedule) {
  const { schedule_id, working_date, start_time, end_time, appointment_duration } = schedule;
  
  // Parse start and end times
  const startMinutes = parseTimeToMinutes(start_time);
  const endMinutes = parseTimeToMinutes(end_time);
  
  // Calculate number of slots
  const totalMinutes = endMinutes - startMinutes;
  const numberOfSlots = Math.floor(totalMinutes / appointment_duration);
  
  // Generate slots
  const slots = [];
  for (let i = 0; i < numberOfSlots; i++) {
    const slotStartMinutes = startMinutes + (i * appointment_duration);
    const slotEndMinutes = slotStartMinutes + appointment_duration;
    
    slots.push({
      schedule_id,
      working_date,
      start_time: minutesToTimeString(slotStartMinutes),
      end_time: minutesToTimeString(slotEndMinutes),
      is_book: false
    });
  }
  
  // Bulk create all slots
  if (slots.length > 0) {
    await AppointmentSlot.bulkCreate(slots);
  }
}

/**
 * Helper function to parse time string to minutes
 * @param {String} timeString - Time string (HH:MM:SS)
 * @returns {Number} Total minutes
 */
function parseTimeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return (hours * 60) + minutes;
}

/**
 * Helper function to convert minutes to time string
 * @param {Number} minutes - Total minutes
 * @returns {String} Time string (HH:MM:00)
 */
function minutesToTimeString(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
}

module.exports = doctorScheduleService;