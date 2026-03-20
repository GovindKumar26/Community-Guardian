# Community Guardian

**Community Safety & Digital Wellness Platform**

A calm, AI-powered platform that aggregates community safety and digital security data, filters out noise, and provides actionable safety digests. Built for Palo Alto Networks.

---

## Problem Statement

As digital and physical security threats become more complex, individuals struggle to keep up with relevant safety information. Information is scattered across news sites and social media, leading to alert fatigue or unnecessary anxiety without actionable steps.

**Community Guardian** solves this by providing a single, calm, and empowering platform that uses AI to filter noise and deliver contextually relevant safety alerts with actionable checklists.

---

## Features

### Core Features
- **Safety Alert Dashboard** — AI-processed, filtered alerts organized by severity and category
- **CRUD Operations** — Create, View, Update alerts + Search/Filter by category, location, severity
- **AI-Powered Digests** — Personalized safety summaries using Google Gemini AI
- **User Incident Submission** — Submit reports and receive AI-generated actionable checklists
- **Privacy-First Safe Circles** — Encrypted (AES-256-CBC) emergency messaging with trusted guardians

### AI Integration + Fallback
- **AI**: Google Gemini API for categorization, summarization, and checklist generation
- **Fallback**: Rule-based keyword matching + pre-built templates when AI is unavailable
- **Transparency**: UI badges show "AI-Generated" vs "Rule-Based" for every result

### Security & Trust
- **AI Scam Sense** — Proactive Gemini-driven scanning to auto-flag potential scams/phishing
- **Registration Honeypot** — Stealth bot protection to block automated account creation
- **E2EE Circles** — AES-256-CBC encryption for private safe circle messaging
- **Defense in Depth** — Helmet (CSP), Rate limiting, NoSQL injection prevention, HTTP-Only cookies
- **Soft Lockout** — Protection against brute-force login attacks
- **Input validation** — Zod schemas with strong type safety

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript (Vite) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| AI | Google Gemini API |
| Validation | Zod |
| Auth | JWT + bcrypt |
| Styling | Vanilla CSS |
| Testing | Jest |

---

## Project Structure

```
community-guardian/
├── client/                # React + TypeScript frontend
│   └── src/
│       ├── components/    # Navbar, AlertCard, SearchFilter
│       ├── context/       # Auth context
│       ├── pages/         # Dashboard, Alerts, Digest, SafeCircles, etc.
│       ├── services/      # API service layer
│       └── types/         # TypeScript definitions
│
├── server/                # Node.js + Express backend
│   └── src/
│       ├── config/        # Database connection
│       ├── lib/           # AI integration, fallback, encryption
│       ├── middleware/     # Auth, validation, rate limiting
│       ├── models/        # Mongoose schemas
│       ├── routes/        # API endpoints
│       └── schemas/       # Zod validation schemas
│
├── data/                  # Synthetic mock data (JSON)
└── __tests__/             # Jest test suite
```

## Getting Started

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

**Backend (`server/.env`):**
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secure random string
- `GEMINI_API_KEY`: Get from Google AI Studio
- `ENCRYPTION_KEY`: 64-character hex string (for Safe Circles)
- `FRONTEND_URL`: `http://localhost:5173` (Dev) or Vercel URL (Prod)

**Frontend (`client/.env`):**
- `VITE_API_URL`: `http://localhost:5000/api` (Dev) or Render URL (Prod)

### 3. Seed Database (Demo Mode)

To populate the app with realistic data for a demo:
```bash
cd server
npm run seed
```

### 4. Run

```bash
# Terminal 1 (Backend)
cd server && npm run dev

# Terminal 2 (Frontend)
cd client && npm run dev
```

---

## Deployment

### Frontend (Vercel)
1. Add a new project on Vercel and point it to the `client/` directory.
2. Set Environment Variables (`VITE_API_URL`).
3. Vercel will automatically use `vercel.json` for routing.

### Backend (Render)
1. Create a "Web Service" on Render and point it to the `server/` directory.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Set Environment Variables (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `ENCRYPTION_KEY`, `FRONTEND_URL`, `NODE_ENV=production`).

---

## Tests

```bash
cd server
npm test
```

- **Test 1 (Happy Path)**: Verifies fallback categorization, checklists, and digest generation work correctly
- **Test 2 (Edge Case)**: Simulates AI failure and verifies the system gracefully falls back to rule-based logic.

---

## Responsible AI

- **Transparency**: Clear labeling of all AI-generated content.
- **Safety First**: Proactive scanning for malicious content via "Scam Sense".
- **Resilient UI**: High-maturity design using Lucide icons and glassmorphism (replacing all emojis for a professional Palo Alto Networks-aligned aesthetic).
- **Privacy-First**: Zero-tracking model; contextual relevance achieved without user geolocation.
