const authService = require('./../service/Auth.service');

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
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