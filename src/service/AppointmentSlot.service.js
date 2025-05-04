const AppointmentSlot = require('../model/AppointmentSlot.model');
const DoctorSchedule = require('../model/DoctorSchedule.model');

const createSlot = async (data) => {
  return await AppointmentSlot.create(data);
};

const getAllSlots = async () => {
  return await AppointmentSlot.findAll({
    include: [{ model: DoctorSchedule }]
  });
};

const getSlotById = async (id) => {
  return await AppointmentSlot.findByPk(id, {
    include: [{ model: DoctorSchedule }]
  });
};

const updateSlot = async (id, data) => {
  const slot = await AppointmentSlot.findByPk(id);
  if (!slot) throw new Error('Slot not found');
  return await slot.update(data);
};

const deleteSlot = async (id) => {
  const slot = await AppointmentSlot.findByPk(id);
  if (!slot) throw new Error('Slot not found');
  return await slot.destroy();
};

module.exports = {
  createSlot,
  getAllSlots,
  getSlotById,
  updateSlot,
  deleteSlot
};
