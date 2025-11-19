const Job = require("../models/Job");

exports.listJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: "Job not found" });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.recommendJobs = async (req, res) => {
  try {
    const { role, location, minSalary } = req.body;
    let query = {};
    if (role) query.role = role;
    if (location) query.location = new RegExp(location, "i");
    const jobs = await Job.find(query).sort({ salary: -1 });

    const filtered = jobs.filter(j => (minSalary ? j.salary >= minSalary : true));
    res.json({ success: true, jobs: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
