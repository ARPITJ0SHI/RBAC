const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Role description is required'],
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  parentRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  level: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for faster lookups
roleSchema.index({ name: 1 });
roleSchema.index({ level: 1 });

// Pre-save middleware to update level based on parent role
roleSchema.pre('save', async function(next) {
  if (this.parentRole) {
    const parentRole = await this.constructor.findById(this.parentRole);
    if (parentRole) {
      this.level = parentRole.level + 1;
    }
  }
  next();
});

// Method to get effective permissions (including inherited from parent roles)
roleSchema.methods.getEffectivePermissions = async function() {
  let allPermissions = new Set([...this.permissions]);
  
  let currentRole = this;
  while (currentRole.parentRole) {
    currentRole = await this.constructor.findById(currentRole.parentRole)
      .populate('permissions');
    if (currentRole) {
      currentRole.permissions.forEach(perm => allPermissions.add(perm._id));
    } else {
      break;
    }
  }
  
  return Array.from(allPermissions);
};

// Method to check if role has specific permission
roleSchema.methods.hasPermission = async function(permissionId) {
  const effectivePermissions = await this.getEffectivePermissions();
  return effectivePermissions.some(p => p.toString() === permissionId.toString());
};

// Static method to get role hierarchy
roleSchema.statics.getHierarchy = async function() {
  const roles = await this.find()
    .populate('parentRole')
    .populate('permissions')
    .sort('level');

  const buildHierarchy = (roles, parentId = null, level = 0) => {
    return roles
      .filter(role => 
        (!parentId && !role.parentRole) || 
        (role.parentRole && role.parentRole._id.toString() === parentId)
      )
      .map(role => ({
        _id: role._id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        level,
        children: buildHierarchy(roles, role._id.toString(), level + 1),
      }));
  };

  return buildHierarchy(roles);
};

const Role = mongoose.model('Role', roleSchema);
module.exports = Role; 