const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Permission description is required'],
  },
  category: {
    type: String,
    required: [true, 'Permission category is required'],
    enum: ['User Management', 'Role Management', 'Permission Management', 'System'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for faster lookups
permissionSchema.index({ name: 1 });
permissionSchema.index({ category: 1 });

const Permission = mongoose.model('Permission', permissionSchema);
module.exports = Permission; 