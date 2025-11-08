const express = require("express");
const router = express.Router();
const statisticsController = require("../../controllers/statisticsController");

// Basic genre routes
router.route("/genre").get(statisticsController.sumPopularityByGenre); // Get all genres popularties
router.route("/profile-views/:userId").get(statisticsController.dailyViews); // Get views by profile

module.exports = router;
