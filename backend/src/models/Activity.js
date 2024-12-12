const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'PASSWORD_CHANGE',
      'PROFILE_UPDATE',
      'ROLE_ASSIGNED',
      'PERMISSION_GRANTED',
      'PERMISSION_REVOKED',
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'ROLE_CREATED',
      'ROLE_UPDATED',
      'ROLE_DELETED',
      'PERMISSION_CREATED',
      'PERMISSION_UPDATED',
      'PERMISSION_DELETED',
      'MFA_ENABLED',
      'MFA_DISABLED',
      'SESSION_EXPIRED',
      'FAILED_LOGIN',
    ],
  },
  details: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success',
  },
}, {
  timestamps: true,
});

// Indexes for faster querying
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ action: 1, createdAt: -1 });
activitySchema.index({ status: 1 });

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity; 