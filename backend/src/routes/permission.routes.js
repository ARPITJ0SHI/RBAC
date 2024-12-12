const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
  getPermissionsByCategory,
  bulkUpdatePermissions,
} = require('../controllers/permission.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getAllPermissions)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Permission name is required'),
      body('description').trim().notEmpty().withMessage('Description is required'),
      body('category').trim().notEmpty().withMessage('Category is required')
        .isIn(['User Management', 'Role Management', 'Permission Management', 'System'])
        .withMessage('Invalid category'),
    ],
    checkPermission('permission.create'),
    createPermission
  );

router.route('/bulk-update')
  .patch(
    checkPermission('permission.update'),
    bulkUpdatePermissions
  );

router.route('/category/:category')
  .get(getPermissionsByCategory);

router.route('/:id')
  .get(getPermissionById)
  .patch(
    checkPermission('permission.update'),
    updatePermission
  )
  .delete(
    checkPermission('permission.delete'),
    deletePermission
  );

module.exports = router; 