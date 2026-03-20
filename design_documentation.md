# Design Documentation: Community Guardian

## 1. Overview
**Community Guardian** is an empowerment-first safety platform that reduces anxiety by turning alerts into clear, actionable steps. It is built as a lightweight SPA with a secure API layer, optional AI augmentation, and privacy-first data handling.

## 2. High-Level Architecture
**Community Guardian** follows a modern, MERN-adjacent architecture designed for independent scalability and high security.
- **Layer 1 (Frontend)**: Vite-driven React 18 SPA with atomic components and calming UI patterns.
- **Layer 2 (Backend)**: Node.js REST API (Express) for auth, validation, encryption, and orchestration.
- **Layer 3 (AI Engine)**: Google Gemini 2.5 Flash for summaries and checklists with a rule-based fallback.
- **Layer 4 (Database)**: MongoDB Atlas (NoSQL) for flexible incident modeling and user preferences.

### Data Flow (Happy Path)
1. User signs in (JWT in HTTP-only cookie).
2. User creates an alert.
3. Backend validates input (Zod) and runs AI summarization and categorization.
4. Alert is stored, returned with actionable steps.
5. Feed updates and optional digest generation occur on demand.

### Data Flow (Edge Case: AI Unavailable)
1. User creates an alert.
2. Backend validates input (Zod) and attempts AI calls.
3. AI is unavailable or returns invalid output.
4. Rule-based categorization, summary, and checklist are generated.
5. Alert is stored and returned with rule-based actionable steps and badges.

---

## 3. Project Vision
**Community Guardian** is designed to reduce the anxiety typically associated with neighborhood watch apps. It emphasizes relevance, calm language, and clear next steps over sensationalism.

---

## 4. Design Philosophy & UX
### Aesthetic: "Sapphire Glass"
- **Visual Direction**: Soft colors and panels, soft borders, and high-contrast typography.
- **Anxiety Reduction**: "Community Wins" and reassuring language to emphasize control and progress.
- **Responsive Layout**: Mobile-first layout with a consistent token system in CSS.

### Core Pillars
1. **Contextual Relevance**: Filtering, location scoping, and preference-driven digests.
2. **Empowerment**: Each alert returns an actionable checklist.
3. **Trust & Privacy**: Neighborhood-based relevance without GPS tracking; encrypted safe-circle communication.

---

## 5. Technical Stack

### Frontend (React + Vite)
*   **Framework**: React 18 with TypeScript for type safety and scalability.
*   **State Management**: React Context API for authentication and global states.
*   **Styling**: Vanilla CSS with custom modern design tokens (Glassmorphism).
*   **Icons**: Lucide React for consistent, high-quality iconography.
*   **Communication**: Axios with interceptors for global authentication state handling.

### Backend (Node.js + Express)
*   **Runtime**: Node.js (v18+) providing a lightweight, high-performance event loop.
*   **Framework**: Express.js with `express-async-errors` for robust, simplified error handling.
*   **Validation**: Zod schema validation for strict data integrity at the edge of every route.
*   **Security Architecture**:
    *   **Auth**: JWT-based authentication stored in **HTTP-Only Cookies**.
    *   **Headers**: Helmet with a Custom Content Security Policy (CSP).
    *   **Throttling**: 4-tier Rate Limiting (Global, Auth, API, AI).
    *   **Sanitization**: `express-mongo-sanitize` for NoSQL injection prevention.

### Artificial Intelligence (Google Gemini 2.5 Flash)
- **Summarization**: Non-alarmist summaries for incidents and digests.
- **Categorization**: Assigns category and subcategory with a confidence score.
- **Actionability**: Produces 4-7 task-specific safety steps.
- **Resilience**: Keyword-based fallback keeps the product functional when AI is unavailable.

### Persistence & Storage (MongoDB Atlas)
*   **Database**: MongoDB (NoSQL) for flexible schema design for alerts and circles.
*   **ORM**: Mongoose for modeling and deep population of relationships (Vouching/Members).
*   **Encryption**: **AES-256-CBC** used for end-to-end encryption of messages within Safe Circles.

---

## 6. Key Security Implementations
- **Account Lockout**: Soft lockout after 5 failed login attempts.
- **Registration Honeypot**: Invisible fields to catch bots.
- **Zero-Tracking Privacy**: Neighborhood-based relevance without GPS or device tracking.
- **Defense in Depth**: Helmet CSP, rate limiting, and NoSQL sanitization at the API layer.

## 7. API and Feature Highlights
- **Alerts**: CRUD, search, filtering, and community verification.
- **Digests**: AI or rule-based summaries of active alerts.
- **Safe Circles**: Encrypted member messaging with membership checks and creator controls.

---

## 8. Future Enhancements
- **Safety Buddy**: Privacy-preserving check-in timer for solo travel.
- **Neighborhood Outlook**: Weekly AI trend analysis for local safety.
- **Verified Guardian Network**: Opt-in trusted volunteers for incidents.
- **AI Scam Training**: Safe simulations for user education.
- **Digital Footprint Cleanup**: Privacy review and remediation suggestions.
- **Real-time notifications**: Real time alerts and notifications using websockets
