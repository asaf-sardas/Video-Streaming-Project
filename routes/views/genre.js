const express = require("express");
const router = express.Router();

// Genre page
router.get("/", (req, res) => {
  res.render("content/genre");
});
module.exports = router;
