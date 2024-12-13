const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');
const basePermissions = require('./permissions');
const baseRoles = require('./roles');
const logger = require('../config/logger');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    const systemUserId = new mongoose.Types.ObjectId();

    logger.info('Seeding permissions...');
    const permissionPromises = basePermissions.map(permission => 
      Permission.findOneAndUpdate(
        { name: permission.name },
        { ...permission, createdBy: systemUserId },
        { upsert: true, new: true }
      )
    );
    const permissions = await Promise.all(permissionPromises);
    logger.info(`${permissions.length} permissions seeded`);

    const permissionMap = permissions.reduce((acc, p) => {
      acc[p.name] = p._id;
      return acc;
    }, {});

    logger.info('Seeding roles...');
    const rolePromises = baseRoles.map(role => {
      const rolePermissions = role.permissions.map(p => permissionMap[p]);
      return Role.findOneAndUpdate(
        { name: role.name },
        {
          ...role,
          permissions: rolePermissions,
          createdBy: systemUserId,
        },
        { upsert: true, new: true }
      );
    });
    const roles = await Promise.all(rolePromises);
    logger.info(`${roles.length} roles seeded`);

    const adminRole = roles.find(r => r.name === 'admin');

    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    if (!adminExists) {
      logger.info('Creating admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await User.create({
        _id: systemUserId,
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'Admin User',
        role: adminRole._id,
        mfaEnabled: true,
      });
      logger.info('Admin user created');
    }

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase; 