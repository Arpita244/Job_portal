const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const profileRoutes = require("./routes/profileRoutes");
const roleRoutes = require("./routes/roleRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const jobRoutes = require("./routes/jobRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/profile", profileRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/ai", aiRoutes);

// health
app.get("/", (req, res) => res.send("Jobsupi Backend Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
