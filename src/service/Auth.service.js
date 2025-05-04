const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/User.model'); // Ton modèle Sequelize
const Patient = require('../model/Patient.model'); // Ton modèle Sequelize
const { Op } = require('sequelize');
const Doctor = require('../model/Doctor.model');

const SECRET = process.env.JWT_SECRET || 'secret_key';


exports.register = async ({ firstName, lastName, email, password, phone, role, image }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error('Email already in use');

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    role,
    password: hashedPassword,
    image // base64 or URL
  });

  // If the role is 'patient', create patient details
  // if (role === 'patient') {
  //   await Patient.create({
  //     user_id: newUser.user_id,
  //     date_birthday,
  //     sexe
  //   });
  // }

  const token = jwt.sign({ userId: newUser.user_id, role: newUser.role }, SECRET, { expiresIn: '7d' });

  return {
    token,
    userId: newUser.user_id,
    role: newUser.role
  };
};



exports.registerDoctor = async ({
  firstName, lastName, email, password, phone, role, image,
  adresse, clinique_name, location, speciality, facebook_link,
  tiktok_link, instagram_link, about, patiens, rating,
  reviewCount, yearsExperience
}) => {
  // Vérification si l'email est déjà utilisé
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error('Email already in use');

  // Hachage du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Création du nouvel utilisateur
  const newUser = await User.create({
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    role,
    password: hashedPassword,
    image // base64 ou URL
  });

  // Si l'utilisateur est un docteur, création du Doctor associé
  if (role === 'doctor') {
    await Doctor.create({
      adresse: adresse || null,
      clinique_name: clinique_name || null,
      location: location || null,
      speciality: speciality, // obligatoire
      facebook_link: facebook_link || null,
      instagram_link: instagram_link || null,
      tiktok_link: tiktok_link || null,
      about: about || null,
      patiens: patiens ?? 0,         // utilise la valeur fournie ou 0
      rating: rating ?? 0,            // utilise la valeur fournie ou 0
      reviewCount: reviewCount ?? 0,  // idem
      yearsExperience: yearsExperience ?? 0,
      user_id: newUser.user_id // FK vers User
    });
  }

  // Génération du token JWT
  const token = jwt.sign(
    { userId: newUser.user_id, role: newUser.role },
    SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    userId: newUser.user_id,
    role: newUser.role
  };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Invalid credentials');

  const token = jwt.sign({ userId: user.user_id, role: user.role }, SECRET, { expiresIn: '7d' });
  return {
    token,
    userId: user.user_id,
    role: user.role
  };
};
 