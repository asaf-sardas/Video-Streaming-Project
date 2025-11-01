const Content = require("../models/content");
const mongoose = require("mongoose");

exports.createContent = async (req, res) => {
  try {
    const content = await Content.create(req.body);
    res.status(201).json({ success: true, data: content });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!content) {
      return res
        .status(404)
        .json({ success: false, error: "Content not found" });
    }

    res.json({ success: true, data: content });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);

    if (!content) {
      return res
        .status(404)
        .json({ success: false, error: "Content not found" });
    }

    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
