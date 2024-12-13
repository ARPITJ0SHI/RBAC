const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true, 
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
    index: true, 
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: String,
  lastLogin: {
    type: Date,
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


userSchema.index({ role: 1, status: 1 });
userSchema.index({ email: 1, status: 1 }); 
userSchema.index({ createdAt: -1, status: 1 }); 

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 