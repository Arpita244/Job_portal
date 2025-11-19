const express = require("express");
const router = express.Router();
const { createProfile, getProfile } = require("../controllers/profileController");

router.post("/create", createProfile);
router.get("/:id", getProfile);

module.exports = router;
