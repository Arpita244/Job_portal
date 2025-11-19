# 🚀 Job Recommendation Platform (AI-Enhanced)

A modern job-matching web application where users can:

- Build their profile
- Get AI-powered job role suggestions
- Browse jobs
- View job details
- Manage everything with a clean dashboard UI

The platform is built using React + Node.js + MongoDB + an AI backend (OpenAI/Gemini or any LLM).

---

## 📌 Features

✅ Profile Builder

Users can enter:

- Name
- Phone
- Skills (comma-separated)
- Interests (comma-separated)
- Preferred location
- Minimum salary

The system saves this profile to the backend.

🤖 AI Role Suggestion

After saving, the backend generates:

- Suggested roles
- AI reasoning

Suggestions are displayed inside the Dashboard. If AI fails, an alert is shown: "AI failed. Please try again later."

📊 Dashboard

Includes:

- Profile summary
- Recommended AI job roles
- Job listings grid
- Job details panel

💼 Job Listing System

Jobs are displayed in a responsive grid with:

- Card layout
- Shadows
- Clean typography

🎨 UI Styling

Completely custom CSS with:

- Glass effect cards
- Spaced grids
- Smooth focus states
- Fully responsive design

---

## 🗂 Folder Structure (recommended)

client
 ├── src
 │   ├── components/
 │   ├── pages/
 │   ├── styles/
 │   │    ├── auth.css
 │   │    ├── dashboard.css
 │   │    ├── jobs.css
 │   │    ├── jobDetails.css
 │   │    └── globals.css
 │   ├── App.jsx
 │   └── main.jsx
 └── README.md

server
 ├── routes/
 ├── controllers/
 ├── models/
 ├── config.js
 ├── index.js
 └── package.json

---

## ⚙️ Tech Stack

Frontend

- React
- Axios
- Custom CSS (no frameworks)
- React Router

Backend

- Node.js
- Express.js
- MongoDB
- OpenAI API / any LLM

---

## 🛠 API Endpoints (summary)

POST /api/profile

Save/update user profile
Request example:

```json
{
  "name": "Arpita",
  "phone": "9999999999",
  "skills": ["riding", "delivery"],
  "interests": ["delivery"],
  "location": "Delhi",
  "minSalary": 15000
}
```

POST /api/ai/suggestions

Generates job role suggestions
Response example:

```json
{
  "roles": ["Delivery Rider", "Warehouse Associate"],
  "reason": "User's skills match operational and mobility tasks."
}
```

If something fails, the frontend shows: "AI failed".

---

## 📐 UI Styling Notes

Profile Page

Two-column aligned form using CSS Grid + nth-child selectors.

Dashboard

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
}

Job Cards

.job-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

Job Details

Simple clean white card with soft shadow.

---

## ▶️ Running the Project

Install dependencies

Frontend:

```powershell
cd client
npm install
npm run dev
```

Backend:

```powershell
cd server
npm install
npm start
```

> Note: In your workspace the folders may be named `frontend/` and `Backend/`. Adjust paths accordingly (e.g. `cd frontend` or `cd Backend`).

---

## 🧪 Environment Variables

Create a `.env` file inside `server/` (or `Backend/`) with:

```
MONGO_URI=your_mongo_url
OPENAI_API_KEY=your_key
PORT=5000
```

If you use Google Gemini, set `GEMINI_API_KEY` instead and ensure your backend reads that variable.

---

## 🎉 Future Improvements

- User authentication
- Resume upload + AI resume scoring
- Job scraper integration
- Notifications system
- ML-based recommendation model

---
