const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id)
        .populate({
          path: 'role',
          populate: {
            path: 'permissions',
            select: 'name',
          },
        });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
        });
      }

      if (user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          success: false,
          error: 'Password recently changed. Please log in again',
        });
      }

      req.user = user;
      next();
    } catch (err) {
      logger.error('JWT Verification failed:', err);
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route',
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate({
        path: 'role',
        populate: {
          path: 'permissions',
          select: 'name',
        },
      });

      if (!roles.includes(user.role.name)) {
        return res.status(403).json({
          success: false,
          error: 'User role is not authorized to access this route',
        });
      }

      req.userRole = user.role;
      next();
    } catch (err) {
      next(err);
    }
  };
};

exports.checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate({
        path: 'role',
        populate: {
          path: 'permissions',
          select: 'name',
        },
      });

      const hasPermission = user.role.permissions.some(
        permission => permission.name === requiredPermission
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'User does not have permission to perform this action',
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}; 