const express = require("express");
const router = express.Router();
const sumPopularityByGenre = require("../controllers/statisticsController");

// Basic genre routes
router.route("/").get(sumPopularityByGenre.sumPopularityByGenre); // Get all genres popularties

module.exports = router;
