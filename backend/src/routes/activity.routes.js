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

router.use(authorize('admin'));
router.get('/', getActivities);
router.get('/stats', getActivityStats);
router.delete('/cleanup', deleteOldActivities);

router.get('/user/:userId', checkPermission('activity.read'), getUserActivities);

module.exports = router; 