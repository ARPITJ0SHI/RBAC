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

    // Create system user for seeding
    const systemUserId = new mongoose.Types.ObjectId();

    // Seed Permissions
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

    // Create permission map for role creation
    const permissionMap = permissions.reduce((acc, p) => {
      acc[p.name] = p._id;
      return acc;
    }, {});

    // Seed Roles
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

    // Find admin role for admin user creation
    const adminRole = roles.find(r => r.name === 'admin');

    // Create admin user if it doesn't exist
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