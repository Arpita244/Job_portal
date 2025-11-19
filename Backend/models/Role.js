const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  role: { type: String, required: true },
  description: { type: String },
  skills_required: { type: [String], default: [] },
  personality_fit: { type: [String], default: [] },
  suggested_salary_range: { type: String }
});

module.exports = mongoose.model("Role", roleSchema);
