const Role = require('../models/Role');
const User = require('../models/User');

exports.createRole = async (req, res, next) => {
  try {
    const role = await Role.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find()
      .populate('permissions')
      .populate('parentRole')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRoleById = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('permissions')
      .populate('parentRole')
      .populate('createdBy', 'name email');

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found',
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    console.log('Updating role with data:', req.body);
    const { parentRole, ...updateData } = req.body;

    // Handle parent role update
    if (parentRole !== undefined) {
      updateData.parentRole = parentRole;
    }

    console.log('Processed update data:', updateData);

    // Check for circular dependency
    if (updateData.parentRole) {
      const parentRoleDoc = await Role.findById(updateData.parentRole);
      if (!parentRoleDoc) {
        return res.status(400).json({
          success: false,
          error: 'Parent role not found'
        });
      }

      // Check if the new parent is not a child of current role
      let currentParent = parentRoleDoc;
      while (currentParent) {
        if (currentParent._id.toString() === req.params.id) {
          return res.status(400).json({
            success: false,
            error: 'Circular dependency detected in role hierarchy'
          });
        }
        currentParent = await Role.findById(currentParent.parentRole);
      }
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
    .populate('permissions')
    .populate('parentRole')
    .populate('createdBy', 'name email');

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    console.log('Updated role:', role);

    // Update level for this role and all its children
    await updateRoleLevels(role);

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (err) {
    console.error('Error in updateRole:', err);
    next(err);
  }
};

// Helper function to update role levels
async function updateRoleLevels(role) {
  // Get all roles that have this role as parent
  const childRoles = await Role.find({ parentRole: role._id });
  
  for (const childRole of childRoles) {
    childRole.level = role.level + 1;
    await childRole.save();
    // Recursively update children's levels
    await updateRoleLevels(childRole);
  }
}

exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found',
      });
    }

    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({ role: role._id });
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete role that is assigned to users',
      });
    }

    // Check if role is parent to other roles
    const childRoles = await Role.countDocuments({ parentRole: role._id });
    if (childRoles > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete role that has child roles',
      });
    }

    await Role.findByIdAndDelete(role._id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

exports.getRoleHierarchy = async (req, res, next) => {
  try {
    console.log('Fetching role hierarchy...');
    // Get all roles with complete data
    const roles = await Role.find()
      .populate({
        path: 'permissions',
        select: 'name description'
      })
      .populate({
        path: 'parentRole',
        select: 'name description'
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .lean(); // Convert to plain JavaScript objects

    console.log('Found roles:', roles);

    // Transform roles to include all necessary data
    const rolesWithData = roles.map(role => ({
      _id: role._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
      parentRole: role.parentRole,
      level: role.level,
      createdBy: role.createdBy,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    }));

    console.log('Transformed roles:', rolesWithData);

    // Build hierarchy from the complete data
    const buildHierarchy = (roles, parentId = null) => {
      return roles
        .filter(role => 
          (!parentId && !role.parentRole) || 
          (role.parentRole && role.parentRole._id.toString() === parentId)
        )
        .map(role => ({
          ...role,
          children: buildHierarchy(roles, role._id.toString())
        }));
    };

    const hierarchy = buildHierarchy(rolesWithData);
    console.log('Built hierarchy:', hierarchy);

    res.status(200).json({
      success: true,
      data: hierarchy
    });
  } catch (err) {
    console.error('Error in getRoleHierarchy:', err);
    next(err);
  }
};

exports.cloneRole = async (req, res, next) => {
  try {
    const sourceRole = await Role.findById(req.params.id).populate('permissions');
    
    if (!sourceRole) {
      return res.status(404).json({
        success: false,
        error: 'Source role not found',
      });
    }

    const { name, description } = req.body;
    const newRole = await Role.create({
      name,
      description,
      permissions: sourceRole.permissions.map(p => p._id),
      parentRole: sourceRole.parentRole,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: newRole,
    });
  } catch (err) {
    next(err);
  }
};

exports.getEffectivePermissions = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found',
      });
    }

    const effectivePermissions = await role.getEffectivePermissions();

    res.status(200).json({
      success: true,
      data: effectivePermissions,
    });
  } catch (err) {
    next(err);
  }
}; 