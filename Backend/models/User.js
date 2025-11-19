const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  experience: { type: String },
  personality: { type: String },
  location: { type: String },
  salaryPreference: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
