const User = require ('../model/User.model')
const FCM = require ('../model/Fcm.model')


const registerToken  = async (req, res) => {
  try {
    console.log("Token reçu:", req.body);
    
    const { userId, token } = req.body;
    
    // Vérification des données requises
    if (!userId || !token) {
      return res.status(400).json({ error: "Missing fields" });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Rechercher si un token FCM existe déjà pour cet utilisateur
    const existingFCM = await FCM.findOne({ where: { user_id: userId } });
    
    if (existingFCM) {
      // Mettre à jour le token existant
      existingFCM.token = token;    
      await existingFCM.save();
      console.log("Token mis à jour:", token);
      return res.status(200).json({ message: "Token mis à jour" });
    } else {
      // Créer un nouvel enregistrement FCM
      const newFCM = await FCM.create({
        user_id: userId,
        token: token
      });
      console.log("Nouveau token enregistré:", token);
      return res.status(201).json({ message: "Nouveau token enregistré" });
    }
    
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du token:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}


const logout = async (req, res) => {
    const { userId } = req.user;

    try {
        // Rechercher le token FCM de l'utilisateur dans la base de données
        const fcmRecord = await FCM.findOne({ where: { user_id: userId } });
        
        // Vérifier si un token existe pour cet utilisateur
        if (!fcmRecord) {
            return res.status(404).json({ error: "Token FCM non trouvé pour cet utilisateur" });
        }
        
        // Supprimer le token de la base de données
        await fcmRecord.destroy();
        
        return res.status(200).json({ message: "Token supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du token:", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
}

module.exports = {registerToken,logout}