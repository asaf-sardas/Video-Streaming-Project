const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.route("/").post(adminController.createContent); // Create new content

// Routes for specific content
router
  .route("/:id")
  .put(adminController.updateContent) // Update content
  .delete(adminController.deleteContent); // Delete content

module.exports = router;
