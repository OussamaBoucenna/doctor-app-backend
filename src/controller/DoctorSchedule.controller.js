const DoctorScheduleService = require('../service/DoctorSchedule.service');

const doctorScheduleController = {
  /**
   * Create a new doctor schedule
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  createSchedule: async (req, res) => {
    try {
      const scheduleData = req.body;
      const newSchedule = await DoctorScheduleService.createSchedule(scheduleData);
      return res.status(201).json({
        success: true,
        message: 'Doctor schedule created successfully',
        data: newSchedule
      });
    } catch (error) {
      console.error('Error creating doctor schedule:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create doctor schedule',
        error: error.message
      });
    }
  },


  createSchedulesByDay: async (req, res) => {
    try {
      const dayName = req.headers.journee; // 'mercredi'
      if (!dayName) return res.status(400).json({ error: "Missing 'journee' header" });
  
      const { doctor_id, start_time, end_time, appointment_duration } = req.body;
      if (!doctor_id || !start_time || !end_time || !appointment_duration) {
        return res.status(400).json({ error: "Missing required body fields" });
      }
  
      const createdSchedules = await DoctorScheduleService.createSchedulesForDay(
        dayName,
        doctor_id,
        start_time,
        end_time,
        appointment_duration
      );
  
      res.status(201).json(createdSchedules);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Get all doctor schedules
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getAllSchedules: async (req, res) => {
    try {
      const schedules = await DoctorScheduleService.getAllSchedules();
      return res.status(200).json({
        success: true,
        message: 'Doctor schedules retrieved successfully',
        data: schedules
      });
    } catch (error) {
      console.error('Error fetching doctor schedules:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch doctor schedules',
        error: error.message
      });
    }
  },

  /**
   * Get a doctor schedule by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getScheduleById: async (req, res) => {
    try {
      const { id } = req.params;
      const schedule = await DoctorScheduleService.getScheduleById(id);
      
      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: `Doctor schedule with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Doctor schedule retrieved successfully',
        data: schedule
      });
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch doctor schedule',
        error: error.message
      });
    }
  },

  /**
   * Get schedules by doctor ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getSchedulesByDoctorId: async (req, res) => {
    try {
      const { doctorId } = req.params;
      const schedules = await DoctorScheduleService.getSchedulesByDoctorId(doctorId);
      
      return res.status(200).json({
        success: true,
        message: 'Doctor schedules retrieved successfully',
        data: schedules
      });
    } catch (error) {
      console.error('Error fetching doctor schedules:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch doctor schedules',
        error: error.message
      });
    }
  },

  /**
   * Update a doctor schedule
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  updateSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const scheduleData = req.body;
      
      const updatedSchedule = await DoctorScheduleService.updateSchedule(id, scheduleData);
      
      if (!updatedSchedule) {
        return res.status(404).json({
          success: false,
          message: `Doctor schedule with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Doctor schedule updated successfully',
        data: updatedSchedule
      });
    } catch (error) {
      console.error('Error updating doctor schedule:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update doctor schedule',
        error: error.message
      });
    }
  },

  /**
   * Delete a doctor schedule
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  deleteSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await DoctorScheduleService.deleteSchedule(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: `Doctor schedule with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Doctor schedule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting doctor schedule:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete doctor schedule',
        error: error.message
      });
    }
  }
};

module.exports = doctorScheduleController;