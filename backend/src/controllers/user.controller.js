const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    // Filter by status if specified
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by role if specified
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password -mfaSecret')
      .populate('role', 'name')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -mfaSecret')
      .populate('role', 'name permissions');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if role exists
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
      });
    }

    // Generate a random password if not provided by admin
    const finalPassword = password || Math.random().toString(36).slice(-8);

    const user = await User.create({
      email,
      password: finalPassword,
      name,
      role,
      createdBy: req.user._id,
    });

    await req.logActivity(
      'USER_CREATED',
      `User ${user.name} (${user.email}) created`,
      { userId: user._id }
    );

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        generatedPassword: password ? undefined : finalPassword, // Only send back if we generated it
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { password, role, permissions, ...updateData } = req.body;
    
    // Prevent any role or permission updates through this endpoint
    if (role || permissions) {
      return res.status(400).json({
        success: false,
        error: 'Role and permission updates must be done through dedicated endpoints',
      });
    }

    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -mfaSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    await req.logActivity(
      'USER_UPDATED',
      `User ${user.name} (${user.email}) updated`,
      { userId: user._id }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role ID is required',
      });
    }

    // Verify the role exists
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
      });
    }

    // Update only the role field
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -mfaSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    await req.logActivity(
      'USER_ROLE_UPDATED',
      `User ${user.name} (${user.email}) role updated to ${roleExists.name}`,
      { userId: user._id, roleId: role }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Store user info for activity log
    const userInfo = {
      name: user.name,
      email: user.email,
      id: user._id,
    };

    await User.findByIdAndDelete(user._id);

    await req.logActivity(
      'USER_DELETED',
      `User ${userInfo.name} (${userInfo.email}) deleted`,
      { userId: userInfo.id }
    );

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -mfaSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    await req.logActivity(
      'USER_UPDATED',
      `User ${user.name} status changed to ${status}`,
      { userId: user._id }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.bulkUpdateStatus = async (req, res, next) => {
  try {
    const { userIds, status } = req.body;

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { status }
    );

    await req.logActivity(
      'USER_UPDATED',
      `Bulk status update to ${status} for ${result.modifiedCount} users`,
      { userIds }
    );

    res.status(200).json({
      success: true,
      data: {
        modified: result.modifiedCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.bulkAssignRole = async (req, res, next) => {
  try {
    const { userIds, roleId } = req.body;

    // Verify role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { role: roleId }
    );

    await req.logActivity(
      'ROLE_ASSIGNED',
      `Bulk role assignment to ${role.name} for ${result.modifiedCount} users`,
      { userIds, roleId }
    );

    res.status(200).json({
      success: true,
      data: {
        modified: result.modifiedCount,
      },
    });
  } catch (err) {
    next(err);
  }
}; 