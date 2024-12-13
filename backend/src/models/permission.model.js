const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: String,
  category: {
    type: String,
    required: true,
    index: true,
  },
  resource: {
    type: String,
    required: true,
    index: true, 
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  isSystem: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});


permissionSchema.index({ category: 1, isSystem: 1 }); 
permissionSchema.index({ resource: 1, action: 1 }); 
permissionSchema.index({ name: 1, category: 1 }); 

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission; 