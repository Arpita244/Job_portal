// For now: return a simple static roadmap for requested role.
// Can be replaced with AI generator later.

exports.getRoadmap = async (req, res) => {
  try {
    const role = req.params.role || "";
    // simple example roadmap
    const roadmap = {
      role,
      steps: [
        "Understand basic tools and safety",
        "Learn 3 core skills relevant to role",
        "Practice with small paid tasks",
        "Apply to 10 entry-level jobs"
      ],
      duration: "2-8 weeks",
      resources: [
        "YouTube search: 'basic {role} tutorial' (replace {role})",
        "Local vocational courses"
      ]
    };

    res.json({ success: true, roadmap });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
