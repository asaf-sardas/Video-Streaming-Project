const logger = require("../utils/logger");

function getDurationMs(startTime) {
  try {
    // Support high-resolution time if available
    if (typeof process.hrtime.bigint === "function" && typeof startTime === "bigint") {
      const diffNs = process.hrtime.bigint() - startTime;
      return Number(diffNs) / 1e6;
    }
    const diff = process.hrtime(startTime);
    return diff[0] * 1000 + diff[1] / 1e6;
  } catch {
    return null;
  }
}

function stringifyCompact(obj, maxLen = 400) {
  try {
    if (!obj) return "";
    const str = JSON.stringify(obj);
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + `…(+${str.length - maxLen} chars)`;
  } catch {
    return "";
  }
}

module.exports = function httpRequestLogger(req, res, next) {
  const start = typeof process.hrtime.bigint === "function" ? process.hrtime.bigint() : process.hrtime();

  res.on("finish", () => {
    try {
      const durationMs = getDurationMs(start);
      const statusCode = res.statusCode || 0;
      const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warning" : "info";

      // Avoid logging very noisy health checks if needed:
      const url = req.originalUrl || req.url || "";
      const method = req.method;
      const httpVersion = req.httpVersion;
      const userAgent = req.headers["user-agent"] || null;
      const referrer = req.get ? req.get("referer") || req.get("referrer") || null : null;
      const ip =
        req.ip ||
        (req.connection && req.connection.remoteAddress) ||
        (req.socket && req.socket.remoteAddress) ||
        null;
      const contentLength = res.getHeader("content-length") || null;
      const query = Object.keys(req.query || {}).length ? req.query : null;
      const params = Object.keys(req.params || {}).length ? req.params : null;
      const userId = (req.user && (req.user._id || req.user.id)) || null;
      const routePath = (req.baseUrl || "") + ((req.route && req.route.path) || "");

      const metadata = {
        method,
        url,
        statusCode,
        durationMs,
        contentLength,
        userAgent,
        referrer,
        httpVersion,
        ip,
        routePath: routePath || null,
        // Lightweight request context; avoid sensitive data
        query: query || undefined,
        params: params || undefined,
        userId: userId,
      };

      // Detailed human-readable message
      const parts = [
        `${method} ${url}`,
        `status=${statusCode}`,
        durationMs != null ? `time=${durationMs.toFixed(1)}ms` : "",
        httpVersion ? `http=${httpVersion}` : "",
        contentLength ? `len=${contentLength}` : "",
        routePath ? `route=${routePath}` : "",
        userId ? `user=${userId}` : "",
        ip ? `ip=${ip}` : "",
        userAgent ? `ua="${userAgent}"` : "",
        referrer ? `ref="${referrer}"` : "",
        query ? `query=${stringifyCompact(query)}` : "",
        params ? `params=${stringifyCompact(params)}` : "",
      ].filter(Boolean);
      const message = parts.join(" | ");

      // Non-blocking best-effort logging
      logger
        .log(level, message, "http", metadata)
        .catch(() => {});
    } catch {
      // Ignore logging errors completely
    }
  });

  next();
};


