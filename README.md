# TourAI — Luxury Travel & Bespoke Voyages Concierge

An AI-powered luxury expedition planner and itinerary concierge. TourAI generates custom, multi-day, multi-destination travel itineraries complete with day-wise schedules, curated culinary highlights, travel/transit expense tracking, dynamic budget validation, interactive maps, and meteorological insights.

---

## 🏛️ Architecture Overview

The repository consists of three decoupled microservices:

1. **`frontend/`**: Modern React 19 single-page application built with Vite, Leaflet, and an editorial luxury design system.
2. **`backend/`**: Node.js & Express REST API with MongoDB Atlas and JWT authentication.
3. **`ai-service/`**: Python / Flask microservice powered by Google Gemini (with intelligent procedural fallback).

---

## 🚀 Quick Start Guide

### 1. Configure Environment Variables

Before starting the applications, configure your local environment files using the provided templates:

- **Backend Configuration**:
  ```bash
  cd backend
  copy .env.example .env     # Windows (cmd)
  # or: cp .env.example .env # macOS / Linux
  ```
  *Ensure `MONGO_URI`, `JWT_SECRET`, and `AI_SERVICE_URL` are properly set.*

- **AI Microservice Configuration**:
  ```bash
  cd ../ai-service
  copy .env.example .env     # Windows (cmd)
  # or: cp .env.example .env # macOS / Linux
  ```
  *Ensure `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/) is configured.*

---

### 2. Run the Services

Open 3 separate terminal sessions:

#### Terminal 1 — AI Service (Port 8000)
```bash
cd ai-service
pip install -r requirements.txt
python run.py
```

#### Terminal 2 — Backend API (Port 5003)
```bash
cd backend
npm install
npm run dev
```

#### Terminal 3 — Frontend Web Application (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173` to explore TourAI.

---

## 🛡️ Security & Git Best Practices

- All `.env` files containing private database connection strings or API keys are strictly excluded via `.gitignore`.
- Never commit active `.env` files to remote version control. Always commit updates to `.env.example`.
