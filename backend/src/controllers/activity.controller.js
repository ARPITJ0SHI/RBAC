const Activity = require('../models/Activity');

exports.getActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};


    if (req.query.userId) {
      query.userId = req.query.userId;
    }


    if (req.query.action) {
      query.action = req.query.action;
    }


    if (req.query.status) {
      query.status = req.query.status;
    }


    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const activities = await Activity.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Activity.countDocuments(query);

    res.status(200).json({
      success: true,
      data: activities,
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

exports.getUserActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const activities = await Activity.find({ userId: req.params.userId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Activity.countDocuments({ userId: req.params.userId });

    res.status(200).json({
      success: true,
      data: activities,
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

exports.getActivityStats = async (req, res, next) => {
  try {
    const stats = await Activity.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
          },
          failureCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] },
          },
          warningCount: {
            $sum: { $cond: [{ $eq: ['$status', 'warning'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          action: '$_id',
          count: 1,
          successRate: {
            $multiply: [
              { $divide: ['$successCount', '$count'] },
              100,
            ],
          },
          failureRate: {
            $multiply: [
              { $divide: ['$failureCount', '$count'] },
              100,
            ],
          },
          warningRate: {
            $multiply: [
              { $divide: ['$warningCount', '$count'] },
              100,
            ],
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteOldActivities = async (req, res, next) => {
  try {
    const { days } = req.body;
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await Activity.deleteMany({
      createdAt: { $lt: date },
    });

    res.status(200).json({
      success: true,
      data: {
        deleted: result.deletedCount,
      },
    });
  } catch (err) {
    next(err);
  }
}; 