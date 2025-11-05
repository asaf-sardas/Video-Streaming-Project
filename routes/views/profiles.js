const express = require("express");
const router = express.Router();

// Profiles page
router.get("/", (req, res) => {
  res.render("auth/profiles");
});

module.exports = router;
