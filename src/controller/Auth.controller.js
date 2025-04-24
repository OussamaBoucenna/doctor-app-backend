const authService = require('./../service/Auth.service');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    const image = req.file ? req.file.buffer : null; // Image en binaire

    const user = await authService.register({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      image
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const authData = await authService.login(req.body);
    res.status(200).json(authData);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};