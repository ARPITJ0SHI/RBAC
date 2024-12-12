const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }

    const user = await User.create({
      email,
      password,
      name,
      role,
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn(`Login failed: User not found for email: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const isMatch = await user.comparePassword(password);
    logger.info(`Password verification result: ${isMatch}`);

    if (!isMatch) {
      logger.warn(`Login failed: Invalid password for email: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    if (user.status === 'inactive') {
      logger.warn(`Login failed: Account inactive for email: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Account is inactive',
      });
    }

    if (user.mfaEnabled) {
      logger.info(`MFA required for user: ${email}`);
      const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      return res.status(200).json({
        requireMFA: true,
        sessionId,
        userId: user._id,
      });
    }

    // Update last login without triggering password rehash
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyMFA = async (req, res, next) => {
  try {
    const { code, sessionId, userId } = req.body;

    const user = await User.findById(userId)
      .select('+mfaSecret')
      .populate('role', 'name');
      
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid session',
      });
    }

    // In production, verify the MFA code using a proper MFA library
    if (code !== '123456') { // Temporary mock verification
      return res.status(401).json({
        success: false,
        error: 'Invalid verification code',
      });
    }

    // Update last login without triggering password rehash
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).populate('role', 'name');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    const token = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      token,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // In production, you might want to blacklist the token
    // For now, we'll rely on the frontend to remove the token
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -mfaSecret')
      .populate('role', 'name');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    });
  } catch (err) {
    next(err);
  }
}; 