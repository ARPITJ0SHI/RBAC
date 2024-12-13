const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'Role is required'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String,
    select: false,
  },
  lastLogin: {
    type: Date,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  if (this.password.startsWith('$2a$')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('Comparing passwords:');
  console.log('Candidate password:', candidatePassword);
  console.log('Stored hash:', this.password);
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  console.log('Password match result:', isMatch);
  return isMatch;
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User; 