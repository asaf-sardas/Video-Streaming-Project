const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    errorName: err.name,
    errorCode: err.code,
  });

  let statusCode = err.statusCode || err.status;

  if (!statusCode) {
    switch (err.name) {
      case "ValidationError":
      case "CastError":
        statusCode = 400; // Bad Request
        break;
      case "UnauthorizedError":
      case "JsonWebTokenError":
      case "TokenExpiredError":
        statusCode = 401; // Unauthorized
        break;
      case "ForbiddenError":
        statusCode = 403; // Forbidden
        break;
      case "NotFoundError":
        statusCode = 404; // Not Found
        break;
      case "ConflictError":
        statusCode = 409; // Conflict
        break;
      default:
        statusCode = 500; // Internal Server Error
    }
  }

  // Best-effort DB logging (non-blocking)
  logger
    .logError(err.message || "Unhandled error", "errorHandler", {
      url: req.url,
      method: req.method,
      statusCode,
      errorName: err.name,
      errorCode: err.code,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      body: req.body,
      params: req.params,
      query: req.query,
      userId: req?.user?._id || req?.user?.id || null,
    })
    .catch(() => {
      // intentionally ignored
    });

  res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    error: err.name || "Error",
    message: err.message || "Something went wrong on the server",
  });
};

module.exports = errorHandler;
