const User = require("../models/User");

exports.createProfile = async (req, res) => {
  try {
    const data = req.body;

    // normalize simple inputs
    if (typeof data.skills === "string") {
      data.skills = data.skills.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (typeof data.interests === "string") {
      data.interests = data.interests.split(",").map(s => s.trim()).filter(Boolean);
    }

    const user = await User.create(data);
    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
