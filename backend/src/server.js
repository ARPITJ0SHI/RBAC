require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/database");
const logger = require("./config/logger");
const errorHandler = require("./middleware/errorHandler");
const { attachActivityLogger } = require("./middleware/activityLogger");
const seedDatabase = require("./seeders");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const roleRoutes = require("./routes/role.routes");
const permissionRoutes = require("./routes/permission.routes");
const activityRoutes = require("./routes/activity.routes");
const sessionRoutes = require("./routes/session.routes");

const app = express();

const initializeDatabase = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== "production") {
      await seedDatabase();
    }
  } catch (error) {
    logger.error("Database initialization failed:", error);
    process.exit(1);
  }
};

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://rbac-self.vercel.app"]
      : ["http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));
app.use(attachActivityLogger);

// Debug middleware to log all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", message: "Server is healthy" });
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/sessions", sessionRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Modified server startup sequence
const startServer = async () => {
  try {
    await initializeDatabase(); // Connect to database first
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
