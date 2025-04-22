const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//     dialect: 'mysql',
//      logging: false, 
// });

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // This is necessary for Supabase SSL
      }
    },
    logging: false, // optional: disable SQL logging
  });

sequelize.sync({ alter: true })

sequelize.authenticate()
    .then(() => console.log('Database connection established.'))
    .catch((error) => console.error('Unable to connect to the database:', error));

module.exports = { sequelize };
