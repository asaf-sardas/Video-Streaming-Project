const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    level: {
      type: String,
      enum: ["info", "warning", "error"],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: "application",
      trim: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    versionKey: false,
    minimize: true,
  }
);

module.exports = mongoose.models.Log || mongoose.model("Log", LogSchema);


