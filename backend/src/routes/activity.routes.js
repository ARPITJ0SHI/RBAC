const express = require('express');
const router = express.Router();
const {
  getActivities,
  getUserActivities,
  getActivityStats,
  deleteOldActivities,
} = require('../controllers/activity.controller');
const { protect, authorize, checkPermission } = require('../middleware/auth');

router.use(protect);

// Routes accessible by admin only
router.use(authorize('admin'));
router.get('/', getActivities);
router.get('/stats', getActivityStats);
router.delete('/cleanup', deleteOldActivities);

// Routes for getting user's own activities
router.get('/user/:userId', checkPermission('activity.read'), getUserActivities);

module.exports = router; 