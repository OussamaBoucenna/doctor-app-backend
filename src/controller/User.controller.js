const userService = require('./../service/User.service');

const getCurrentUser = async (req, res) => {
  const userId = req.user.userId;

  console.log('User ID:', userId); // Debugging

  try {
    const user = await userService.getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
    getCurrentUser,
};
