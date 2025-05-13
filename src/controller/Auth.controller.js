const authService = require('./../service/Auth.service');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role ,date_birthday , sexe} = req.body;
    const image = req.file ? req.file.buffer : null; // Image en binaire

    console.log('Image:', image); // Debugging
    console.log('Request Body:', req.body); // Debugging
    const user = await authService.register({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      image,
      date_birthday,
      sexe,
      image
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
    console.log('Error:', err.message); // Debugging
  }
};

exports.registerDoctor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      adresse,
      clinique_name,
      location,
      speciality,
      facebook_link,
      instagram_link,
      tiktok_link,
      about,
      patiens,
      rating,
      reviewCount,
      yearsExperience
    } = req.body;

    const image = req.file ? req.file.buffer : null; // Image en binaire

    console.log('Image:', image); // Debugging
    console.log('Request Body:', req.body); // Debugging

    const user = await authService.registerDoctor({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      image,
      adresse,
      clinique_name,
      location,
      speciality,
      facebook_link,
      instagram_link,
      tiktok_link,
      about,
      patiens,
      rating,
      reviewCount,
      yearsExperience
    });

    res.status(201).json(user);
  } catch (err) {
    console.error('Error:', err.message); // Debugging
    res.status(400).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  console.log('Login Request is comming'); // Debugging
  console.log('Login Request Body:', req.body); // Debugging
  try {
    const authData = await authService.login(req.body);
    res.status(200).json(authData);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};