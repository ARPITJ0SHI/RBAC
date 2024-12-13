const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const logger = require('../config/logger');

const resetAdminPassword = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      logger.error('MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    await mongoose.connect(uri);
    logger.info('Connected to MongoDB');

    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      logger.error('Admin role not found. Please run the seeder first.');
      process.exit(1);
    }

    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@gmail.com' },
      {
        $set: {
          email: 'admin@gmail.com',
          password: hashedPassword,
          name: 'Admin User',
          role: adminRole._id,
          status: 'active',
          mfaEnabled: true,
        }
      },
      { upsert: true, new: true, select: '+password' }
    );

    const isMatch = await bcrypt.compare(password, adminUser.password);
    logger.info(`Direct password verification test: ${isMatch}`);
    logger.info(`Current hash in database: ${adminUser.password}`);

    const isMatchModel = await adminUser.comparePassword(password);
    logger.info(`Model method password verification test: ${isMatchModel}`);

    logger.info('Admin user has been created/updated successfully');
    logger.info('Email: admin@gmail.com');
    logger.info('Password: admin123');
    process.exit(0);
  } catch (error) {
    logger.error('Error resetting admin password:', error);
    process.exit(1);
  }
};

resetAdminPassword(); 