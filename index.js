const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/Auth.route');
const { sequelize } = require('./src/config/config'); 



const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);



sequelize
    .authenticate()
    .then(() => {
        return sequelize.sync({ force: false  }); 
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error initializing the database or server:", error);
    });

