const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getRoleHierarchy,
  cloneRole,
  getEffectivePermissions,
} = require('../controllers/role.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getAllRoles)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Role name is required'),
      body('description').trim().notEmpty().withMessage('Description is required'),
      body('permissions').isArray().withMessage('Permissions must be an array'),
    ],
    checkPermission('role.create'),
    createRole
  );

router.get('/hierarchy', getRoleHierarchy);

router.route('/:id')
  .get(getRoleById)
  .patch(
    checkPermission('role.update'),
    updateRole
  )
  .delete(
    checkPermission('role.delete'),
    deleteRole
  );

router.post(
  '/:id/clone',
  [
    body('name').trim().notEmpty().withMessage('New role name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  checkPermission('role.create'),
  cloneRole
);

router.get(
  '/:id/effective-permissions',
  checkPermission('role.read'),
  getEffectivePermissions
);

module.exports = router; 