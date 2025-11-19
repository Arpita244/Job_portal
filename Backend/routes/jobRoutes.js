const express = require("express");
const router = express.Router();
const { listJobs, getJob, recommendJobs } = require("../controllers/jobController");

router.get("/", listJobs);
router.get("/:id", getJob);
router.post("/recommend", recommendJobs);

module.exports = router;
