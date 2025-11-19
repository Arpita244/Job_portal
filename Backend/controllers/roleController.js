const Role = require("../models/Role");

// simple DB-driven role listing (no AI required)
exports.listRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    res.json({ success: true, roles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
