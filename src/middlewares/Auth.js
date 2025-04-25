const jwt = require('jsonwebtoken');

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

module.exports = authMiddleware;