const Permission = require('../models/Permission');

exports.createPermission = async (req, res, next) => {
  try {
    const permission = await Permission.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: permission,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.find()
      .populate('createdBy', 'name email')
      .select('+createdBy');

    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPermissionById = async (req, res, next) => {
  try {
    const permission = await Permission.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!permission) {
      return res.status(404).json({
        success: false,
        error: 'Permission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: permission,
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePermission = async (req, res, next) => {
  try {
    const existingPermission = await Permission.findById(req.params.id);
    if (!existingPermission) {
      return res.status(404).json({
        success: false,
        error: 'Permission not found',
      });
    }

    const { name, description, category, isActive } = req.body;
    
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        description, 
        category, 
        isActive,
        createdBy: existingPermission.createdBy
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: permission,
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePermission = async (req, res, next) => {
  try {
    const permission = await Permission.findByIdAndDelete(req.params.id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        error: 'Permission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

exports.getPermissionsByCategory = async (req, res, next) => {
  try {
    const permissions = await Permission.find({
      category: req.params.category,
    }).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions,
    });
  } catch (err) {
    next(err);
  }
};

exports.bulkUpdatePermissions = async (req, res, next) => {
  try {
    const { permissions } = req.body;
    
    const updates = permissions.map(({ _id, ...updates }) => ({
      updateOne: {
        filter: { _id },
        update: { $set: updates },
      },
    }));

    await Permission.bulkWrite(updates);

    res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
    });
  } catch (err) {
    next(err);
  }
}; 