const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  register,
  login,
  verifyMFA,
  refreshToken,
  logout,
  getCurrentUser,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('name').notEmpty().withMessage('Name is required'),
    body('role').notEmpty().withMessage('Role is required'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post(
  '/verify-mfa',
  [
    body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid MFA code'),
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('userId').notEmpty().withMessage('User ID is required'),
  ],
  verifyMFA
);

router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);

module.exports = router; 