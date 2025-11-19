const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  role: { type: String },
  company: { type: String },
  location: { type: String },
  salary: { type: Number },
  description: { type: String },
  skills: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", jobSchema);
