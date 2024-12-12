const Session = require('../models/Session');
const { logActivity } = require('../middleware/activityLogger');

exports.getUserSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      userId: req.params.userId,
      isActive: true,
    }).sort({ lastActivity: -1 });

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      token: req.headers.authorization?.split(' ')[1],
      isActive: true,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

exports.terminateSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    // Only allow users to terminate their own sessions unless admin
    if (session.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to terminate this session',
      });
    }

    session.isActive = false;
    await session.save();

    await logActivity(
      req.user._id,
      'SESSION_TERMINATED',
      'Session terminated',
      req,
      { sessionId: session._id }
    );

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

exports.terminateAllSessions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentSessionId = req.query.excludeCurrentSession;

    const query = {
      userId,
      isActive: true,
    };

    if (currentSessionId) {
      query._id = { $ne: currentSessionId };
    }

    const result = await Session.updateMany(query, {
      isActive: false,
    });

    await logActivity(
      req.user._id,
      'SESSIONS_TERMINATED',
      `All sessions terminated for user ${userId}`,
      req,
      { userId, excludedSession: currentSessionId }
    );

    res.status(200).json({
      success: true,
      data: {
        terminated: result.modifiedCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      refreshToken: req.body.refreshToken,
      isActive: true,
    });

    if (!session || session.isExpired()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
      });
    }

    // Update session expiry
    const newExpiryDate = new Date();
    newExpiryDate.setHours(newExpiryDate.getHours() + 24);
    session.expiresAt = newExpiryDate;
    session.lastActivity = new Date();
    await session.save();

    await logActivity(
      req.user._id,
      'SESSION_REFRESHED',
      'Session refreshed',
      req,
      { sessionId: session._id }
    );

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSessionStats = async (req, res, next) => {
  try {
    const [activeSessions, expiredSessions] = await Promise.all([
      Session.countDocuments({
        isActive: true,
        expiresAt: { $gt: new Date() },
      }),
      Session.countDocuments({
        $or: [
          { isActive: false },
          { expiresAt: { $lte: new Date() } },
        ],
      }),
    ]);

    const stats = {
      activeSessions,
      expiredSessions,
      totalSessions: activeSessions + expiredSessions,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

exports.cleanupExpiredSessions = async (req, res, next) => {
  try {
    const deletedCount = await Session.cleanupExpired();

    await logActivity(
      req.user._id,
      'SESSIONS_CLEANED',
      `Cleaned up ${deletedCount} expired sessions`,
      req
    );

    res.status(200).json({
      success: true,
      data: {
        deletedCount,
      },
    });
  } catch (err) {
    next(err);
  }
}; 