const AppointmentSlot = require('../model/AppointmentSlot.model');
const DoctorSchedule = require('../model/DoctorSchedule.model');
const Doctor = require('../model/Doctor.model');
const { sequelize } = require('../config/config');
const { Op } = require('sequelize');

const appointmentSlotService = {
  /**
   * Get all appointment slots
   * @returns {Array} List of appointment slots
   */
  getAllSlots: async () => {
    try {
      return await AppointmentSlot.findAll({
        include: [
          {
            model: DoctorSchedule,
            include: [Doctor]
          }
        ]
      });
    } catch (error) {
      console.error('Error in getAllSlots service:', error);
      throw error;
    }
  },

  /**
   * Get an appointment slot by ID
   * @param {Number} slotId - Slot ID
   * @returns {Object} Appointment slot
   */
  getSlotById: async (slotId) => {
    try {
      return await AppointmentSlot.findByPk(slotId, {
        include: [
          {
            model: DoctorSchedule,
            include: [Doctor]
          }
        ]
      });
    } catch (error) {
      console.error('Error in getSlotById service:', error);
      throw error;
    }
  },

  /**
   * Get available appointment slots by doctor ID
   * @param {Number} doctorId - Doctor ID
   * @param {String} date - Optional date filter (YYYY-MM-DD)
   * @returns {Array} List of available appointment slots
   */
  getAvailableSlotsByDoctorId: async (doctorId, date) => {
    try {
      const whereClause = {
        is_book: false
      };

      // If date is provided, add it to where clause
      if (date) {
        whereClause.working_date = date;
      } else {
        // If no date specified, get slots from today onward
        whereClause.working_date = {
          [Op.gte]: new Date().toISOString().split('T')[0]
        };
      }

      return await AppointmentSlot.findAll({
        where: whereClause,
        include: [
          {
            model: DoctorSchedule,
            where: { doctor_id: doctorId },
            include: [Doctor]
          }
        ],
        order: [
          ['working_date', 'ASC'],
          ['start_time', 'ASC']
        ]
      });
    } catch (error) {
      console.error('Error in getAvailableSlotsByDoctorId service:', error);
      throw error;
    }
  },

  /**
   * Get slots by schedule ID
   * @param {Number} scheduleId - Schedule ID
   * @returns {Array} List of appointment slots
   */
  getSlotsByScheduleId: async (scheduleId) => {
    try {
      return await AppointmentSlot.findAll({
        where: { schedule_id: scheduleId },
        order: [['start_time', 'ASC']]
      });
    } catch (error) {
      console.error('Error in getSlotsByScheduleId service:', error);
      throw error;
    }
  },

  /**
   * Create a single appointment slot
   * @param {Object} slotData - Appointment slot data
   * @returns {Object} New appointment slot
   */
  createSlot: async (slotData) => {
    try {
      return await AppointmentSlot.create(slotData);
    } catch (error) {
      console.error('Error in createSlot service:', error);
      throw error;
    }
  },

  /**
   * Update an appointment slot
   * @param {Number} slotId - Slot ID
   * @param {Object} slotData - Updated slot data
   * @returns {Object} Updated appointment slot
   */
  updateSlot: async (slotId, slotData) => {
    try {
      const slot = await AppointmentSlot.findByPk(slotId);
      
      if (!slot) {
        return null;
      }
      
      // If slot is booked and trying to change schedule_id, prevent it
      if (slot.is_book && slotData.schedule_id && slot.schedule_id !== slotData.schedule_id) {
        throw new Error('Cannot change schedule for a booked slot');
      }
      
      await slot.update(slotData);
      return slot;
    } catch (error) {
      console.error('Error in updateSlot service:', error);
      throw error;
    }
  },

  /**
   * Delete an appointment slot
   * @param {Number} slotId - Slot ID
   * @returns {Boolean} True if deleted, false if not found
   */
  deleteSlot: async (slotId) => {
    try {
      const slot = await AppointmentSlot.findByPk(slotId);
      
      if (!slot) {
        return false;
      }
      
      // Prevent deletion of booked slots
      if (slot.is_book) {
        throw new Error('Cannot delete a booked slot');
      }
      
      await slot.destroy();
      return true;
    } catch (error) {
      console.error('Error in deleteSlot service:', error);
      throw error;
    }
  },

  /**
   * Update slot booking status
   * @param {Number} slotId - Slot ID
   * @param {Boolean} isBooked - Booking status
   * @returns {Object} Updated appointment slot
   */
  updateSlotBookingStatus: async (slotId, isBooked) => {
    try {
      const slot = await AppointmentSlot.findByPk(slotId);
      
      if (!slot) {
        return null;
      }
      
      await slot.update({ is_book: isBooked });
      return slot;
    } catch (error) {
      console.error('Error in updateSlotBookingStatus service:', error);
      throw error;
    }
  },


  getSlotsByDoctorIdAndDate: async (doctorId, workingDate) => {
    try {
      // Fetching appointment slots by doctor_id and working_date
      const slots = await AppointmentSlot.findAll({
        include: {
          model: DoctorSchedule,  // Join with Schedule model
          where: {
            doctor_id: doctorId  // Filter by doctor_id from the Schedule table
          }
        },
        where: {
          working_date: workingDate  // Filter by working_date in the AppointmentSlot table
        }
      });

      // Return slots if available
      if (slots.length === 0) {
        return null;
      }

      return slots;
    } catch (error) {
      console.error('Error fetching appointment slots:', error);
      throw new Error('Failed to fetch appointment slots');
    }
  }
  
};

module.exports = appointmentSlotService;