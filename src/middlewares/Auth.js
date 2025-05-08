const jwt = require('jsonwebtoken');
const  Doctor  = require('../model/Doctor.model'); // Assurez-vous que le chemin est correct

const SECRET = process.env.JWT_SECRET || 'secret_key';

const authMiddleware = (req, res, next) => {
  // Récupération du token dans l'en-tête Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Décodage et vérification du token
    const decoded = jwt.verify(token, SECRET);

    // Attache les infos du token à la requête
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next(); // Passe à la route suivante
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

const getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      where: { user_id: req.user.userId } // ✅ correction ici
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Aucun médecin trouvé avec cet userId' });
    }

    req.doctorId = doctor.doctor_id; // ✅ OK si c’est bien doctor_id dans ta table
    next(); // Passe à la route suivante
  } catch (error) {
    console.error('Erreur lors de la récupération du doctorId :', error.message);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};



module.exports = {authMiddleware,getDoctor};