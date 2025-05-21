const userService = require('./../service/User.service');

const getCurrentUser = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await userService.getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getUserPatienById = async (req, res) => {
  const userId = req.user.userId;
    console.log('Request id:', userId); // Debugging
  try {
    const user = await userService.getUserPatienById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateUserPatientById = async (req, res) => {
  const userId = req.user.userId;
  const {
    first_name,
    last_name,
    email,
    phone,
    date_birthday,
    sexe,
  } = req.body;
   const image = req.file ? req.file.buffer : null; // Image en binaire

    console.log('Image:', image); // Debugging
    console.log('Request Body:', req.body); // Debugging
  console.log(first_name, last_name, email, phone, image, date_birthday, sexe); // Debugging
  console.log('Request id:', userId); // Debugging
  try {
    const updatedUser = await userService.updateUserPatientById(
      userId,
      { first_name, last_name, email, phone, image },      // champs USER
      { date_birthday, sexe }                              // champs PATIENT
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = {
    getCurrentUser,
    getUserPatienById,
    updateUserPatientById
};
