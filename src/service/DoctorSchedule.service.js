// services/DoctorSchedule.service.js
const DoctorSchedule = require('../model/DoctorSchedule.model');
const Doctor = require('../model/Doctor.model');

const createSchedule = async (data) => {
  return await DoctorSchedule.create(data);
};

const getAllSchedules = async () => {
  return await DoctorSchedule.findAll({
    include: [{ model: Doctor }]
  });
};

const getScheduleById = async (id) => {
  return await DoctorSchedule.findByPk(id, {
    include: [{ model: Doctor }]
  });
};

const updateSchedule = async (id, data) => {
  const schedule = await DoctorSchedule.findByPk(id);
  if (!schedule) throw new Error('Schedule not found');
  return await schedule.update(data);
};

const deleteSchedule = async (id) => {
  const schedule = await DoctorSchedule.findByPk(id);
  if (!schedule) throw new Error('Schedule not found');
  return await schedule.destroy();
};

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule
};
