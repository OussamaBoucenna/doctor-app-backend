const slotService = require('../service/AppointmentSlot.service');

exports.createSlot = async (req, res) => {
  try {
    const slot = await slotService.createSlot(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllSlots = async (req, res) => {
  try {
    const slots = await slotService.getAllSlots();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSlotById = async (req, res) => {
  try {
    const slot = await slotService.getSlotById(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const updated = await slotService.updateSlot(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    await slotService.deleteSlot(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
