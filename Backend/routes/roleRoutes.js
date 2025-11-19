const express = require("express");
const router = express.Router();
const { listRoles } = require("../controllers/roleController");

router.get("/", listRoles);

module.exports = router;
