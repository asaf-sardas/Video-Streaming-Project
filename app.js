const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const logger = require("./utils/logger");
require("dotenv").config();
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Sessions (using MongoDB store)
app.use(
  session({
    name: "vsid",
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
      collectionName: "sessions",
      stringify: false,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true behind HTTPS/proxy
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Expose authenticated user to requests and views
app.use((req, res, next) => {
  const user = req.session && req.session.user ? req.session.user : null;
  req.user = user;
  res.locals.user = user;
  next();
});

// Persist HTTP request logs to DB (non-blocking)
app.use(require("./middleware/httpRequestLogger"));

// Serve static files from public directory
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("MongoDB connected");
    logger.logInfo("MongoDB connected", "database");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    logger.logError("MongoDB connection error", "database", {
      error: err?.message,
    });
  });

// Import API routes
app.use("/api/content", require("./routes/api/contentRoutes"));
app.use("/api/genres", require("./routes/api/genreRoutes"));
app.use("/api/episodes", require("./routes/api/episodeRoutes"));
app.use("/api/admin", require("./routes/api/adminRoutes"));
app.use("/api/stats", require("./routes/api/statisticsRoutes"));
app.use("/api/users", require("./routes/api/userRoutes"));
app.use("/api/viewings", require("./routes/api/viewingHabitRoutes"));
app.use("/api/auth", require("./routes/api/authRoutes"));
app.use("/api/profiles", require("./routes/api/profileRoutes"));

// Import view routes (EJS pages)
app.use("/", require("./routes/views/feed"));
app.use("/feed", require("./routes/views/feed"));
app.use("/profiles", require("./routes/views/profiles"));
app.use("/login", require("./routes/views/login"));
app.use("/register", require("./routes/views/register"));
app.use("/genre", require("./routes/views/genre"));
app.use("/content", require("./routes/views/content"));
app.use("/add-content", require("./routes/views/add-content"));
app.use("/settings", require("./routes/views/settings"));

// 404 Handler
app.use((req, res) => {
  // Log as warning but do not interrupt flow
  logger.logWarning("Route not found", "router", {
    method: req.method,
    url: req.url,
    query: req.query,
  });
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: "NotFoundError",
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Global Error Handling Middleware
const errorHandler = require("./middleware/errorHandleMiddleware");
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.logInfo("Server started", "server", {
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });
});

// Process-level safety nets (best-effort logging, non-fatal for app flow)
process.on("unhandledRejection", (reason) => {
  logger.logError("Unhandled Promise rejection", "process", {
    reason:
      (reason && reason.message) ||
      (typeof reason === "string" ? reason : "unknown"),
  });
});

process.on("uncaughtException", (err) => {
  logger.logError("Uncaught Exception", "process", {
    message: err?.message,
    stack: err?.stack,
  });
});

module.exports = app;
