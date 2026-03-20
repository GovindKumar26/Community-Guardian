# Community Guardian: Submission Form

**Candidate Name**: Govind Kumar
**Scenario Chosen**: Community Safety & Digital Wellness (Neighborhood Resilience)
**Estimated Time Spent**: ~5.5 Hours

---

## Quick Start
### Prerequisites:
*   Node.js (v18+)
*   MongoDB Atlas (Free tier or local)
*   Google Gemini API Key (Optional — fallback is rule-based)

### Run Commands:
```bash
# Terminal 1: Backend
cd server
npm install
npm run seed  # Populates demo data
npm run dev

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

### Test Commands:
```bash
cd server
npm test
```

---

## AI Disclosure
### Did you use an AI assistant? 
**Yes** (ChatGPT & Gemini 2.5 Flash).

### How did you verify the suggestions?
*   **Unit Tests**: Created a full Jest suite to verify AI categorization and rule-based fallbacks.
*   **Manual Testing**: Manually tested all AI-generated content for safety logic.
*   **Used Postman to test API endpoints**
*   **Security Audits**: Manually reviewed all AI-suggested security headers and cookie policies.
*   **Functional Testing**: Manually verified every AI-generated checklist for safety logic.

### Example of a suggestion you rejected or changed:
I initially considered using a 3rd party **Leaflet/Google Maps API** for geolocation tracking. I **rejected** this to prioritize the "Privacy-First" pillar of the case challenge. Instead, I built a zero-tracking model based on user-selected neighborhoods (manual input), which achieved high contextual relevance without ever needing access to the user's live GPS coordinates.

---

## Tradeoffs & Prioritization
### What did you cut to stay within the 4–6 hour limit?
*   **WebSockets (Socket.io)**: I opted out of full Bi-directional WebSockets to minimize server-side state and dependencies. Instead, I implemented a **Smart Polling** system for real-time updates.
*   **Profile Pictures**: Cut image upload/storage to focus on core security and AI features.

### What would you build next if you had more time?
*   **"Safety Buddy" Timer**: A feature where a user can set a timer (e.g., "15 mins walk home"). If they don't check in, an emergency AES-256 encrypted alert is instantly sent to their Safe Circles.
*   **AI Scammer Simulation**: An educational tool where Gemini "acts" like a scammer to help users identify phishing patterns.
*   **Real-time Push Notifications**: Integration with Firebase/VAPID for mobile-native alerts.

### Known limitations:
*   **Single-Hood Focus**: Currently, a user can only be part of one neighborhood at a time.
*   **Smart Polling**: The dashboard and feed refresh every 30 seconds; while highly reactive, it lacks the sub-second immediacy of full WebSockets.
*   **Cookie Domain**: In production, requires specific `SameSite: None` and `Secure` cookie settings to support cross-domain communication between Vercel and Render.
