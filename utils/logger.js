const Log = require("../models/log");

class LoggerService {
  constructor() {
    this.isDev = (process.env.NODE_ENV || "development") !== "production";
  }

  async log(level, message, source = "application", metadata = null) {
    try {
      // Optional console output in development
      if (this.isDev) {
        // eslint-disable-next-line no-console
        console.log(
          `[${new Date().toISOString()}] ${level.toUpperCase()}${source ? ` [${source}]` : ""}:`,
          message,
          metadata ? { metadata } : ""
        );
      }

      // Persist to database asynchronously
      await Log.create({
        level,
        message,
        source,
        metadata,
      });
    } catch (err) {
      // Never interrupt main flow on logging failures
      // eslint-disable-next-line no-console
      console.error("LoggerService failed to persist log:", {
        error: err?.message,
        level,
        source,
        message,
      });
    }
  }

  async logInfo(message, source = "application", metadata = null) {
    return this.log("info", message, source, metadata);
  }

  async logWarning(message, source = "application", metadata = null) {
    return this.log("warning", message, source, metadata);
  }

  async logError(message, source = "application", metadata = null) {
    return this.log("error", message, source, metadata);
  }
}

module.exports = new LoggerService();


