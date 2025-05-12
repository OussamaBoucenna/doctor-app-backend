const { sequelize } = require('./src/config/config');
const Specialty = require('./src/model/Specialty.model');

async function insertSpecialty() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to the database.');

    const newSpecialty = await Specialty.create({
      name: 'Psychology'
    });

    console.log('✅ Specialty inserted:', newSpecialty.toJSON());
  } catch (error) {
    console.error('❌ Error inserting specialty:', error);
  }
}

insertSpecialty();
