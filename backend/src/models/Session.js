const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: String,
    browser: String,
    os: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  mfaVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for faster lookups
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Update lastActivity timestamp
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Check if session is expired
sessionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Check if session requires refresh
sessionSchema.methods.needsRefresh = function(refreshThreshold = 5 * 60 * 1000) {
  const timeToExpiry = this.expiresAt.getTime() - Date.now();
  return timeToExpiry <= refreshThreshold;
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false },
    ],
  });
  return result.deletedCount;
};

// Static method to get active sessions count for user
sessionSchema.statics.getActiveSessionsCount = async function(userId) {
  return this.countDocuments({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session; 