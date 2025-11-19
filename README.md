# Job_Portal

Jobsupi is a MERN-style job/learning assistant web app with optional AI role-suggestion features (Google Gemini / Generative AI). This repository contains a backend (Express + MongoDB) and a frontend (React).

---

## Contents

- `Backend/` — Express API, MongoDB models, AI routes
- `frontend/` — React frontend app

---

## Features

- Role and job CRUD endpoints (MongoDB)
- AI-powered role suggestions and chat-like helper endpoints (optional, uses Google Generative API / Gemini)
- Frontend UI pages for roles, jobs, profile, and AI suggestions

---

## Prerequisites

- Node.js (v16+ recommended)
- npm
- MongoDB running locally or a MongoDB URI
- (Optional) Google Generative AI / Gemini API key if you want live AI suggestions

---

## Environment

Create a `.env` file inside the `Backend/` folder (there is a sample `.env` in the repo). Important env vars used by the backend:

- `PORT` — port the backend runs on (default 5000)
- `MONGO_URI` — your MongoDB connection string (e.g. `mongodb://127.0.0.1:27017/jobsupi`)
- `GEMINI_API_KEY` — (optional) API key for Google's Generative API (used by AI endpoints)

Example `Backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/jobsupi
GEMINI_API_KEY=your_api_key_here
```

Notes:
- The backend reads env variables using `dotenv` (in `server.js`).
- The AI controller expects `GEMINI_API_KEY` (the code was updated to use this name).

---

## Install dependencies

Open two terminals (one for backend, one for frontend):

Backend:

```powershell
cd C:\MERN\PROJECTS\Jobsupi\Backend
npm install
```

Frontend:

```powershell
cd C:\MERN\PROJECTS\Jobsupi\frontend
npm install
```

---

## Run the app (development)

Start MongoDB (if using a local instance).

Start the backend:

```powershell
cd C:\MERN\PROJECTS\Jobsupi\Backend
# If port 5000 is already used, stop that process (see Troubleshooting below)
npm run dev   # uses nodemon if installed, or `npm start` to run once
```

Start the frontend:

```powershell
cd C:\MERN\PROJECTS\Jobsupi\frontend
npm start
```

Frontend expects the backend API at `http://localhost:5000/api` (configured in `frontend/src/api.js`).

---

## Important API endpoints

- GET  /api/roles — list roles
- POST /api/ai/suggest — AI role suggestions (expects a profile object in request body)
- POST /api/ai/match — alternate AI/matching endpoint
- POST /api/ai/chat — general chat / job search helper endpoint

Example profile payload (POST /api/ai/suggest):

```json
{
  "name": "Name",
  "skills": ["javascript", "react"],
  "interests": ["web"],
  "location": "City",
  "salaryPreference": "30k-50k"
}
```

---

## Testing the AI suggestions endpoint (PowerShell)

If the backend is running on port 5000 you can test with PowerShell:

```powershell
Invoke-RestMethod -Uri 'http://localhost:5000/api/ai/suggest' -Method Post \
  -Body (ConvertTo-Json @{ name = 'Test User'; skills = @('javascript','react'); interests = @('web'); location='Delhi'; salaryPreference='30k-50k' }) \
  -ContentType 'application/json' | ConvertTo-Json -Depth 5
```

- If you see a `Gemini key missing` message, confirm `Backend/.env` contains `GEMINI_API_KEY` and that the server was started after adding the `.env`.
- If you don't want to call the real AI service, the backend `aiRoutes.js` includes fallback logic for role matching when the generative key is absent.

---

## Troubleshooting

- Error: `listen EADDRINUSE: address already in use :::5000`
  - Port 5000 is already used. Find and kill the process in PowerShell:

```powershell
netstat -ano | findstr :5000
# note the PID, then:
taskkill /PID <pid> /F
```

- `.env` not loaded / GEMINI key missing
  - Ensure `.env` is in the `Backend/` folder, and that `server.js` loads `dotenv` (this project calls `require('dotenv').config()` in `server.js`).

- Frontend shows "AI failed"
  - Check backend logs where the AI controller logs errors (search for messages like `❌` or `📥 Gemini Response`). The frontend currently posts to `/api/ai/suggest` (see `frontend/src/pages/RoleSuggestions.jsx`).

---

## Development notes and next steps

- The AI integration uses Google Generative API (Gemini). If you plan to use it, secure your key and be mindful of request costs and quotas.
- There is a simple fallback matching function in `Backend/routes/aiRoutes.js` which will return DB-driven suggestions if the AI key or endpoint isn't present.
- Consider adding: more robust error messages to frontend, environment-specific configs, and unit/integration tests for the AI endpoints.

---

## Useful commands

From repo root:

```powershell
# Seed the DB (backend folder)
cd Backend; npm run seed

# Start backend
cd Backend; npm run dev

# Start frontend
cd frontend; npm start
```

---

## License

MIT

---

If you'd like, I can also:
- Add a short CONTRIBUTING section
- Add a simple local mock for AI responses so you can test frontend without a live key
- Improve error reporting in the frontend when AI calls fail

