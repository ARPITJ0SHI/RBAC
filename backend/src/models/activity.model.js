const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, 
  },
  action: {
    type: String,
    required: true,
    index: true, 
  },
  details: {
    type: Object,
    default: {},
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true, 
  },
  resourceType: {
    type: String,
    index: true, 
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'success',
    index: true, 
  },
}, {
  timestamps: true,
});


activitySchema.index({ userId: 1, timestamp: -1 }); 
activitySchema.index({ action: 1, timestamp: -1 }); 
activitySchema.index({ resourceType: 1, resourceId: 1 }); 
activitySchema.index({ timestamp: -1, status: 1 }); 

activitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity; 