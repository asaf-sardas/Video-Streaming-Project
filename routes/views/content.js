const express = require("express");
const router = express.Router();

// Content detail page
router.get("/:id", (req, res) => {
  res.render("content/content-detail", { contentId: req.params.id });
});

module.exports = router;
