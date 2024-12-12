const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const seedDatabase = require('./index');
const logger = require('../config/logger');

const runSeeder = async () => {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      logger.error('MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    await mongoose.connect(uri);
    logger.info('Connected to MongoDB');

    // Run seeder
    await seedDatabase();
    logger.info('Database seeding completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error running seeder:', error);
    process.exit(1);
  }
};

runSeeder(); 