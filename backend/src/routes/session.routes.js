const express = require('express');
const router = express.Router();
const {
  getUserSessions,
  getCurrentSession,
  terminateSession,
  terminateAllSessions,
  refreshSession,
  getSessionStats,
  cleanupExpiredSessions,
} = require('../controllers/session.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth');

router.use(protect);

// Routes for all authenticated users
router.get('/current', getCurrentSession);
router.post('/refresh', refreshSession);

// Routes for users to manage their own sessions
router.get('/user/:userId', checkPermission('session.read'), getUserSessions);
router.delete('/:sessionId', checkPermission('session.delete'), terminateSession);
router.delete('/user/:userId', checkPermission('session.delete'), terminateAllSessions);

// Admin only routes
router.use(authorize('admin'));
router.get('/stats', getSessionStats);
router.post('/cleanup', cleanupExpiredSessions);

module.exports = router; 