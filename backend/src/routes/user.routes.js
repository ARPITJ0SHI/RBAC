const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  updateUserStatus,
  bulkUpdateStatus,
  bulkAssignRole,
} = require('../controllers/user.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(checkPermission('user.read'), getAllUsers)
  .post(
    [
      body('email').isEmail().withMessage('Please provide a valid email'),
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
      body('name').notEmpty().withMessage('Name is required'),
      body('role').notEmpty().withMessage('Role is required'),
    ],
    checkPermission('user.create'),
    createUser
  );

router.route('/bulk-status')
  .patch(
    [
      body('userIds').isArray().withMessage('User IDs must be an array'),
      body('status')
        .isIn(['active', 'inactive'])
        .withMessage('Invalid status value'),
    ],
    checkPermission('user.update'),
    bulkUpdateStatus
  );

router.route('/bulk-role')
  .patch(
    [
      body('userIds').isArray().withMessage('User IDs must be an array'),
      body('roleId').notEmpty().withMessage('Role ID is required'),
    ],
    checkPermission('user.update'),
    bulkAssignRole
  );

router.route('/:id')
  .get(checkPermission('user.read'), getUserById)
  .patch(
    [
      body('email').optional().isEmail().withMessage('Please provide a valid email'),
      body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
      body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    ],
    checkPermission('user.update'),
    updateUser
  )
  .delete(checkPermission('user.delete'), deleteUser);

router.patch(
  '/:id/role',
  [
    body('role').notEmpty().withMessage('Role ID is required'),
  ],
  checkPermission('user.manage.role'),
  updateUserRole
);

router.patch(
  '/:id/status',
  [
    body('status')
      .isIn(['active', 'inactive'])
      .withMessage('Invalid status value'),
  ],
  checkPermission('user.update'),
  updateUserStatus
);

module.exports = router; 