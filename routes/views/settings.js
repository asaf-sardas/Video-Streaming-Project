const express = require("express");
const router = express.Router();

// settings page
router.get("/", (req, res) => {
  res.render("content/settings");
});

module.exports = router;
