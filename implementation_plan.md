# Community Guardian — Implementation Plan

A community safety & digital wellness platform that aggregates local safety and digital security data (via mock/synthetic data), uses AI to filter noise, and provides calm, actionable safety digests.

---

## Success Metrics → Design Decisions

| Metric | How We Achieve It |
|---|---|
| **Anxiety Reduction** | Calm color palette (soft blues/greens), empowering language, severity-coded alerts (not alarmist), actionable checklists |
| **Contextual Relevance** | User-selected neighborhood (no GPS), preference-based filtering, AI digest personalized to area + interests |
| **Trust & Privacy** | No geolocation tracking, encrypted Safe Circle messages, passwords hashed (bcrypt), JWT auth, `.env` for secrets |
| **AI Application** | Gemini AI for summarization & categorization; transparent fallback with `AI-Generated` vs `Rule-Based` badges |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | **React 18** + **TypeScript** (Vite) |
| Backend | **Node.js** + **Express** |
| Database | **MongoDB** + **Mongoose** |
| Validation | **Zod** (shared schemas, API validation) |
| AI | **Google Gemini API** |
| Auth | **JWT** (jsonwebtoken + bcrypt) |
| Styling | **Vanilla CSS** |
| Testing | **Vitest** (frontend) + **Jest/Supertest** (backend) |
| Encryption | **crypto** (Node.js built-in, AES-256 for Safe Circles) |

---

## Architecture

```
┌──────────────────────┐         ┌──────────────────────────────┐
│   React + TS (Vite)  │  HTTP   │   Express API Server         │
│   localhost:5173      │◄──────►│   localhost:5000              │
│                      │         │                              │
│  - Dashboard         │         │  - /api/auth     (JWT auth)  │
│  - Alert CRUD pages  │         │  - /api/alerts   (CRUD)      │
│  - AI Digest page    │         │  - /api/digest   (AI)        │
│  - Safe Circles      │         │  - /api/circles  (encrypted) │
│  - Search/Filter     │         │  - /api/seed     (mock data) │
└──────────────────────┘         └──────────┬───────────────────┘
                                            │
                                  ┌─────────┴─────────┐
                                  │     MongoDB       │
                                  └─────────┬─────────┘
                                            │
                                  ┌─────────┴─────────┐
                                  │   Gemini AI API   │
                                  └───────────────────┘
```

---

## Project Structure

```
community-guardian/
├── client/                          # React + TypeScript frontend
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css                # Design system
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # Main alert dashboard
│   │   │   ├── Alerts.tsx           # Alert list + search/filter
│   │   │   ├── AlertDetail.tsx      # Single alert view/edit
│   │   │   ├── NewAlert.tsx         # Submit incident form
│   │   │   ├── Digest.tsx           # AI safety digest
│   │   │   ├── SafeCircles.tsx      # Circle list
│   │   │   ├── CircleDetail.tsx     # Circle messages
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── AlertCard.tsx
│   │   │   ├── AlertForm.tsx
│   │   │   ├── SearchFilter.tsx
│   │   │   ├── ActionChecklist.tsx
│   │   │   ├── AIBadge.tsx          # "AI-Generated" vs "Rule-Based"
│   │   │   ├── SafeCircleCard.tsx
│   │   │   └── EmergencyMessage.tsx
│   │   ├── services/
│   │   │   └── api.ts               # Axios/fetch wrapper
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # JWT auth context
│   │   └── types/
│   │       └── index.ts             # Shared TypeScript interfaces
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── index.ts                 # Express server entry
│   │   ├── routes/
│   │   │   ├── auth.ts              # Register, login, profile
│   │   │   ├── alerts.ts            # CRUD + search/filter
│   │   │   ├── digest.ts            # AI digest generation
│   │   │   ├── circles.ts           # Safe Circles + messages
│   │   │   └── seed.ts              # Seed DB with mock data
│   │   ├── models/
│   │   │   ├── Alert.ts
│   │   │   ├── User.ts
│   │   │   └── SafeCircle.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT verification middleware
│   │   │   └── validate.ts          # Zod validation middleware
│   │   ├── lib/
│   │   │   ├── ai.ts                # Gemini AI integration
│   │   │   ├── fallback.ts          # Rule-based categorization
│   │   │   ├── encryption.ts        # AES-256 for Safe Circles
│   │   │   └── db.ts                # MongoDB connection
│   │   └── schemas/
│   │       ├── alert.schema.ts      # Zod schemas for alerts
│   │       ├── auth.schema.ts       # Zod schemas for auth
│   │       └── circle.schema.ts     # Zod schemas for circles
│   ├── tsconfig.json
│   └── package.json
│
├── data/
│   └── mock-incidents.json          # Synthetic data (ships with repo)
│
├── __tests__/
│   ├── alert-crud.test.ts           # Happy path test
│   └── ai-fallback.test.ts          # Edge case test
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Mock Data Design

File: `data/mock-incidents.json` — ~30-40 synthetic entries

```json
{
  "incidents": [
    {
      "title": "Phishing Email Targeting Local Bank Customers",
      "description": "Multiple residents reported receiving emails impersonating SBI...",
      "category": "digital_threat",
      "subcategory": "phishing",
      "severity": "high",
      "location": "Downtown",
      "source": "system",
      "verified": true,
      "date": "2026-03-15T10:30:00Z"
    }
  ]
}
```

**Categories**: `crime`, `scam`, `digital_threat`, `hazard`, `weather`, `health`
**Locations**: Downtown, Riverside, Oakwood, Hilltop, Lakeview, Greenfield
**Mix**: Verified system alerts + noisy/non-actionable entries (for AI to filter out)

---

## Proposed Changes

### Backend: Auth

#### [NEW] `server/src/routes/auth.ts`
- **POST /api/auth/register** — Register with name, email, password, selectedArea, preferences. Zod validated. Password hashed with bcrypt.
- **POST /api/auth/login** — Returns JWT token.
- **GET /api/auth/me** — Returns current user profile (requires JWT).

---

### Backend: Alert CRUD + Search

#### [NEW] `server/src/routes/alerts.ts`
- **GET /api/alerts** — List alerts with query filters: `?category=scam&location=Downtown&severity=high&search=phishing`
- **POST /api/alerts** — Create alert. Runs AI categorization + checklist generation. Returns alert with actionable steps. Falls back to rule-based if AI fails.
- **GET /api/alerts/:id** — Single alert detail.
- **PUT /api/alerts/:id** — Update alert status (resolved), severity, add follow-up.

---

### Backend: AI Digest

#### [NEW] `server/src/routes/digest.ts`
- **POST /api/digest** — Takes user's area + preferences → Gemini summarizes relevant alerts into a calm, personalized digest. Fallback: grouped alerts with template summaries.

---

### Backend: Safe Circles

#### [NEW] `server/src/routes/circles.ts`
- **POST /api/circles** — Create circle with name + member emails.
- **GET /api/circles** — Get user's circles.
- **GET /api/circles/:id** — Get circle detail + decrypted messages.
- **POST /api/circles/:id/messages** — Send encrypted emergency message.
- **POST /api/circles/:id/members** — Add member to circle.

---

### Backend: AI & Fallback

#### [NEW] `server/src/lib/ai.ts`
- `categorizeAlert(text)` → Gemini categorizes, returns `{ category, confidence, source: "ai" }`
- `summarizeAlerts(alerts)` → Gemini creates calm digest
- `generateChecklist(incident)` → Gemini returns actionable steps
- Each wraps in try/catch → falls back to `fallback.ts`

#### [NEW] `server/src/lib/fallback.ts`
- Keyword-based categorization (e.g., "phishing" → `digital_threat`)
- Pre-built checklist templates per category
- Returns `{ source: "rule-based" }` for UI badge

---

### Backend: Validation (Zod)

#### [NEW] `server/src/schemas/alert.schema.ts`
```typescript
const createAlertSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  category: z.enum(["crime","scam","digital_threat","hazard","weather","health"]),
  location: z.enum(["Downtown","Riverside","Oakwood","Hilltop","Lakeview","Greenfield"]),
  severity: z.enum(["low","medium","high","critical"]),
});
```

---

### Frontend: Key Pages

#### [NEW] `client/src/pages/Dashboard.tsx`
- AI digest summary at top (personalized)
- Filtered alert feed (user's area + preferences)
- Calm severity indicators, alert type badges

#### [NEW] `client/src/pages/NewAlert.tsx`
- Incident submission form (Zod-validated on client too)
- On submit → shows AI-generated actionable report
- Displays `AI-Generated` or `Rule-Based` badge

#### [NEW] `client/src/pages/SafeCircles.tsx` & `CircleDetail.tsx`
- Create/view circles, send encrypted emergency messages

---

### Frontend: Key Components

#### [NEW] `client/src/components/AIBadge.tsx`
Shows `✨ AI-Generated` or `📋 Rule-Based` — transparency for users.

#### [NEW] `client/src/components/ActionChecklist.tsx`
Numbered actionable steps with checkboxes, empowering language.

---

### Testing

#### [NEW] `__tests__/alert-crud.test.ts`
**Happy path**: POST to create alert → verify 201 response with correct fields → GET to retrieve it → verify data matches.

#### [NEW] `__tests__/ai-fallback.test.ts`
**Edge case**: Mock Gemini to throw error → POST alert → verify fallback categorization works → response tagged `source: "rule-based"`.

---

## Verification Plan

### Automated Tests
```bash
cd server && npm test    # Jest + Supertest for API tests
cd client && npm test    # Vitest for component tests
```

### Manual Browser Testing
1. Seed database → verify dashboard shows mock alerts
2. Submit new incident → verify AI processes and returns checklist
3. Filter alerts by category/location → verify correct results
4. View digest → verify personalized AI summary
5. Create Safe Circle → send message → verify encrypted delivery
6. Remove Gemini API key → verify fallback works with "Rule-Based" badge
7. Submit invalid form → verify Zod error messages display
