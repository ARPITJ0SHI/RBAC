const Activity = require('../models/Activity');
const logger = require('../config/logger');

const getClientIp = (req) => {
  return req.ip || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress || 
    req.connection.socket.remoteAddress;
};

const activityLogger = async (userId, action, details, req, metadata = {}, status = 'success') => {
  try {
    const activity = await Activity.create({
      userId,
      action,
      details,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      metadata,
      status,
    });

    logger.info(`Activity logged: ${action} by user ${userId}`);
    return activity;
  } catch (error) {
    logger.error('Error logging activity:', error);
    // Don't throw error to prevent disrupting the main flow
    return null;
  }
};

// Middleware to attach logger to request object
exports.attachActivityLogger = (req, res, next) => {
  req.logActivity = (action, details, metadata = {}, status = 'success') => {
    if (req.user) {
      return activityLogger(req.user._id, action, details, req, metadata, status);
    }
    return Promise.resolve(null);
  };
  next();
};

// Helper function to log activities directly
exports.logActivity = activityLogger; 