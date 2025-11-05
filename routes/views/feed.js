const express = require("express");
const router = express.Router();

// Feed page
router.get("/", (req, res) => {
  res.render("content/feed");
});

module.exports = router;
