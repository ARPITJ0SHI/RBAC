require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const { attachActivityLogger } = require('./middleware/activityLogger');
const seedDatabase = require('./seeders');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const permissionRoutes = require('./routes/permission.routes');
const activityRoutes = require('./routes/activity.routes');
const sessionRoutes = require('./routes/session.routes');

// Initialize express app
const app = express();

// Connect to MongoDB and seed database
const initializeDatabase = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== 'production') {
      await seedDatabase();
    }
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(attachActivityLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/sessions', sessionRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}); 