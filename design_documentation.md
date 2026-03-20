# Design Documentation: Community Guardian

## 1. High-Level Architecture
**Community Guardian** follows a modern, MERN-adjacent architecture designed for independent scalability and high security.
*   **Layer 1 (Frontend)**: A Vite-driven React 18 Single Page Application (SPA), emphasizing atomic component design and high-contrast, anxiety-reducing UI.
*   **Layer 2 (Backend)**: A Node.js REST API with Express, acting as an orchestration layer for authentication, encryption, and AI processing.
*   **Layer 3 (AI Engine)**: Google Gemini Flash 2.5 API, providing context-aware summaries, checklists, and scam detection with a robust rule-based local fallback.
*   **Layer 4 (Database)**: MongoDB Atlas (NoSQL) for flexible incident modeling and secure user preference storage.

---

## 2. Project Vision
**Community Guardian** is an empowerment-first safety platform designed to reduce the anxiety typically associated with neighborhood watch apps. By leveraging AI-driven contextual analysis and proactive security measures, it transforms scary incidents into actionable, community-led solutions.

---

## 3. Design Philosophy & UX
### Aesthetic: "Sapphire Glass"
*   **Visual Direction**: Deep sapphire-glass backgrounds with enhanced blur (glassmorphism) and subtle accent borders.
*   **Color Palette**: Calming teals, deep blues, and high-contrast whites/glowing-warns (instead of emergency red).
*   **Anxiety Reduction**: Use of "Community Wins" and positive micro-animations to highlight safety successes rather than just documenting incidents.
*   **Responsive Layout**: Mobile-first architecture with custom CSS properties for theme consistency.

### Core Pillars
1.  **Contextual Relevance**: Multi-hood filtering and AI-personalized digests ensures users only see what matters.
2.  **Empowerment**: Every alert includes an AI-generated **"Actionable Checklist"** to help users feel in control.
3.  **Trust & Privacy**: No location tracking. Everything is neighborhood-based and private communications are fully encrypted.

---

## 4. Technical Stack

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
*   **Summarization**: Creates non-alarmist, 2-sentence summaries of incidents.
*   **Categorization**: Multi-incident analysis with automatic **"Scam Score"** evaluation.
*   **Actionability**: Generates 4-7 task-specific safety steps for every community report.
*   **Resilience**: Rule-based fallback system (keyword matching) ensures 100% uptime if AI APIs are unreachable.

### Persistence & Storage (MongoDB Atlas)
*   **Database**: MongoDB (NoSQL) for flexible schema design for alerts and circles.
*   **ORM**: Mongoose for modeling and deep population of relationships (Vouching/Members).
*   **Encryption**: **AES-256-CBC** used for end-to-end encryption of messages within Safe Circles.

---

## 5. Key Security Implementations
*   **Account Lockout**: (Soft lockout) Prevents brute-force login attacks by locking IDs after 5 failed attempts.
*   **Registration Honeypot**: Invisible input fields that trap bot-based registrations without alerting the attacker.
*   **Zero-Tracking Privacy**: We achieve contextual relevance through neighborhood selection alone—no invasive GPS or Geolocation tracking needed.

---

## 6. Future Enhancements
*   **The "Safety Buddy" (Privacy Check-ins)**: A timer-based check-in system for walking home.
*   **Neighborhood Safety Outlook**: Weekly AI trend analysis showing how safety metrics are improving.
*   **Volunteer "Verified Guardian" Network**: Gamified roles for verified First Aid, CPR, or Security-trained residents.
*   **AI Scammer Simulation**: Interactive "training grounds" where AI mocks common phishing attempts to educate users safely.
*   **Digital Footprint Cleanup**: An AI tool checking for "digital leakage" and helping users harden their online privacy.
