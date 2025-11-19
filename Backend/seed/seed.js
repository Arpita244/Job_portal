require("dotenv").config();
const mongoose = require("mongoose");
const Role = require("../models/Role");
const Job = require("../models/Job");
const User = require("../models/User");

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jobsupi";

const roles = [
  {
    role: "Delivery Executive",
    description: "Delivers packages locally, requires basic navigation and riding skills",
    skills_required: ["riding", "navigation", "time-management"],
    personality_fit: ["reliable", "punctual"],
    suggested_salary_range: "10000-18000"
  },
  {
    role: "Electrician Helper",
    description: "Assists electricians, learns wiring and tool handling",
    skills_required: ["basic-wiring", "tools-handling"],
    personality_fit: ["careful"],
    suggested_salary_range: "12000-20000"
  },
  {
    role: "Kitchen Assistant",
    description: "Helps with food prep and basic kitchen duties",
    skills_required: ["cooking-basics", "hygiene"],
    personality_fit: ["hardworking"],
    suggested_salary_range: "8000-15000"
  }
];

const jobs = [
  {
    title: "Delivery Executive - Local",
    role: "Delivery Executive",
    company: "QuickShip",
    location: "Mumbai",
    salary: 14000,
    description: "Deliver local packages within city",
    skills: ["riding", "navigation"]
  },
  {
    title: "Kitchen Helper",
    role: "Kitchen Assistant",
    company: "Spice Delight",
    location: "Indore",
    salary: 9000,
    description: "Assist in basic prep and cleaning",
    skills: ["cooking-basics", "hygiene"]
  },
  {
    title: "Apprentice Electrician",
    role: "Electrician Helper",
    company: "BrightElectro",
    location: "Pune",
    salary: 15000,
    description: "Assist with wiring, learn on-the-job",
    skills: ["basic-wiring"]
  }
];

const users = [
  {
    name: "Test User",
    phone: "9999999999",
    skills: ["navigation"],
    interests: ["delivery"],
    experience: "none",
    personality: "punctual",
    location: "Mumbai",
    salaryPreference: 10000
  }
];

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to DB for seeding");

    await Role.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({});

    await Role.insertMany(roles);
    await Job.insertMany(jobs);
    await User.insertMany(users);

    console.log("Seeding done");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
