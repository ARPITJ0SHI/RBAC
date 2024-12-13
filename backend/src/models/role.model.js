const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true, 
  },
  description: String,
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    index: true, 
  }],
  parentRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    index: true, 
  },
  level: {
    type: Number,
    default: 0,
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


roleSchema.index({ level: 1, isSystem: 1 }); 
roleSchema.index({ parentRole: 1, level: 1 }); 
roleSchema.index({ name: 1, isSystem: 1 }); 

const Role = mongoose.model('Role', roleSchema);

module.exports = Role; 