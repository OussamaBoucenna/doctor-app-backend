const AppointmentSlotService = require('../service/AppointmentSlot.service');

const appointmentSlotController = {
  /**
   * Get all appointment slots
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAllSlots: async (req, res) => {
    try {
      const slots = await AppointmentSlotService.getAllSlots();
      return res.status(200).json({
        success: true,
        message: 'Appointment slots retrieved successfully',
        data: slots
      });
    } catch (error) {
      console.error('Error fetching appointment slots:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch appointment slots',
        error: error.message
      });
    }
  },

  /**
   * Get appointment slot by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getSlotById: async (req, res) => {
    try {
      const { id } = req.params;
      const slot = await AppointmentSlotService.getSlotById(id);
      
      if (!slot) {
        return res.status(404).json({
          success: false,
          message: `Appointment slot with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Appointment slot retrieved successfully',
        data: slot
      });
    } catch (error) {
      console.error('Error fetching appointment slot:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch appointment slot',
        error: error.message
      });
    }
  },

  /**
   * Get available slots by doctor ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAvailableSlotsByDoctorId: async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;
      
      const slots = await AppointmentSlotService.getAvailableSlotsByDoctorId(doctorId, date);
      
      return res.status(200).json({
        success: true,
        message: 'Available appointment slots retrieved successfully',
        data: slots
      });
    } catch (error) {
      console.error('Error fetching available appointment slots:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch available appointment slots',
        error: error.message
      });
    }
  },

  /**
   * Get slots by schedule ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getSlotsByScheduleId: async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const slots = await AppointmentSlotService.getSlotsByScheduleId(scheduleId);
      
      return res.status(200).json({
        success: true,
        message: 'Appointment slots retrieved successfully',
        data: slots
      });
    } catch (error) {
      console.error('Error fetching appointment slots:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch appointment slots',
        error: error.message
      });
    }
  },

  /**
   * Create a single appointment slot
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  createSlot: async (req, res) => {
    try {
      const slotData = req.body;
      const newSlot = await AppointmentSlotService.createSlot(slotData);
      
      return res.status(201).json({
        success: true,
        message: 'Appointment slot created successfully',
        data: newSlot
      });
    } catch (error) {
      console.error('Error creating appointment slot:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create appointment slot',
        error: error.message
      });
    }
  },

  /**
   * Update an appointment slot
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  updateSlot: async (req, res) => {
    try {
      const { id } = req.params;
      const slotData = req.body;
      
      const updatedSlot = await AppointmentSlotService.updateSlot(id, slotData);
      
      if (!updatedSlot) {
        return res.status(404).json({
          success: false,
          message: `Appointment slot with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Appointment slot updated successfully',
        data: updatedSlot
      });
    } catch (error) {
      console.error('Error updating appointment slot:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update appointment slot',
        error: error.message
      });
    }
  },

  /**
   * Delete an appointment slot
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  deleteSlot: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await AppointmentSlotService.deleteSlot(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `Appointment slot with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Appointment slot deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting appointment slot:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete appointment slot',
        error: error.message
      });
    }
  },

  /**
   * Get appointment slots by doctor ID and working date
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getSlotsByDoctorIdAndDate: async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { workingDate } = req.query;
  
      const slots = await AppointmentSlotService.getSlotsByDoctorIdAndDate(doctorId, workingDate);
  
      if (!slots || slots.length === 0) {
        return res.status(404).json([]); // Return an empty array instead of a message
      }
  
      return res.status(200).json(slots); // Return the array directly
    } catch (error) {
      console.error('Error fetching appointment slots:', error);
      return res.status(500).json([]); // Also return empty array on server error (or you can return an error object if preferred)
    }
  }
  
  
};

module.exports = appointmentSlotController;