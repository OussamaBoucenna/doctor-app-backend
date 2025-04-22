const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/User.model'); // Ton modèle Sequelize
const { Op } = require('sequelize');

const SECRET = process.env.JWT_SECRET || 'secret_key';

exports.register = async ({ firstName, lastName, email, password, phone, role }) => {
  // Vérifier si l'email existe déjà
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    role,
    password: hashedPassword
  });

  const token = jwt.sign({ userId: newUser.user_id, role: newUser.role }, SECRET, { expiresIn: '7d' });

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
 