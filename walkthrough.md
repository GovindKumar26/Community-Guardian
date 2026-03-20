# Community Guardian — Technical Walkthrough

This document provides a deep dive into the architecture, data models, and functional flows of the **Community Guardian** platform.

---

## High-Level Architecture

Community Guardian is built on a modern **MERN-adjacent** stack optimized for performance, security, and AI integration.

*   **Frontend**: React 18 (Vite) + TypeScript. Uses a professional "Calm UI" design system with vanilla CSS, glassmorphism, and consistent Lucide iconography (replacing all emojis for a more mature, Palo Alto Networks-aligned aesthetic).
*   **Backend**: Node.js + Express. Stateless REST API following a controller-less pattern using middleware for validation and auth.
*   **Database**: MongoDB (Mongoose). Document-oriented storage for flexible alert schemas.
*   **AI Engine**: Google Gemini 2.5 Flash via `@google/generative-ai`. Implements a graceful rule-based fallback system.

---

## Data Models

### 1. User ([User.js](file:///c:/Users/admin/Community%20Guardian/server/src/models/User.js))
*   **Core**: Name, Email (unique), Password (hashed with `bcrypt`).
*   **Preferences**: `selectedArea` (Neighborhood) and `preferences` (Array of Alert Categories).
*   **Security**: `loginAttempts` (Number) and `lockUntil` (Date) for brute-force protection.
*   **Virtuals**: `isLocked` (Boolean) - dynamically calculates if the account is currently throttled.

### 2. Alert ([Alert.js](file:///c:/Users/admin/Community%20Guardian/server/src/models/Alert.js))
*   **Categorization**: `category` (EnumType) and `subcategory` (String).
*   **Source**: `system` (Official) vs `community` (User-reported).
*   **Veracity**: `verified` (Boolean), `verifiedBy` (Array of User IDs), `flaggedBy` (Array of User IDs).
*   **AI Metadata**: `aiSummary`, `aiCategory`, `actionableSteps` (Checklist), `aiSource` (ai | rule-based).

### 3. Safe Circle ([SafeCircle.js](file:///c:/Users/admin/Community%20Guardian/server/src/models/SafeCircle.js))
*   **Trusted Network**: `name`, `members` (Array of User IDs), `createdBy` (User ID).
*   **Encrypted Messages**: Sub-document schema storing `encryptedContent` and the unique initialization vector (IV) for each message.

---

## Security Infrastructure

1.  **Authentication**:
    *   **JWT via HTTP-Only Cookies**: Tokens are stored in **Secure, SameSite=None** cookies in production to allow cross-domain communication between Vercel and Render while blocking XSS theft.
    *   **Soft Lockout**: Accounts lock for 15 minutes after 5 consecutive failed attempts.
2.  **Encryption**:
    *   **AES-256-CBC**: Used for Safe Circle messages. The `ENCRYPTION_KEY` is a 64-character hex string. Every message has a unique initialization vector (IV).
3.  **Proactive Security**:
    *   **AI Scam Sense**: Proactively scans all alerts for phishing/scam patterns and auto-flags them for moderation.
    *   **Stealth Honeypot**: Hidden registration field that traps and blocks automated bot registrations without alerting the bot.
4.  **Content Security Policy (CSP)**:
    *   Strict zero-trust policy via `helmet` that mitigates XSS and clickjacking.
5.  **Data Sanitization**:
    *   `express-mongo-sanitize` prevents NoSQL injection attacks.

---

## Core Functional Flows

### 1. The Alert Lifecycle
1.  **Submission**: User posts an incident.
2.  **AI Processing**: The backend runs categorization, summarization, and checklist generation in parallel via `Promise.all`.
3.  **Enrichment**: The alert is saved with AI-generated actionable steps and a calm summary.
4.  **Community Vouching**:
    *   Users click **Verify** or **Flag**.
    *   **3+ Verifications** → Alert status becomes "Verified".
    *   **3+ Flags** → Alert status becomes "Under Review".

### 2. Personalized AI Digest
1.  Frontend calls `POST /api/digest`.
2.  Backend fetches alerts matching the user's `selectedArea` and `preferences`.
3.  Gemini synthesizes these alerts into a single, cohesive, reassuring narrative.
4.  If AI fails, it falls back to a template-based grouping.

### 3. Encrypted Sharing
1.  User clicks "Share" on an alert.
2.  Message is encrypted on the server with a unique IV before being saved.
3.  Members can only view decrypted messages after passing through the authorization middleware.

---

## API Routes Reference

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/login` | POST | Public | Authenticates & sets HTTP-Only Cookie |
| `/api/alerts/` | GET | Option | List alerts with Search/Filter/Sort |
| `/api/alerts/:id/verify` | POST | Required | Toggle community verification |
| `/api/circles/` | GET | Required | List user's trusted circles |
| `/api/digest` | POST | Required | Generate personalized AI safety report |

---

## Testing State
*   **API Tests**: Passing (Zod validation, Auth guards, AI fallbacks).
*   **Frontend Quality**: 0 TypeScript errors, WCAG color contrast compliant, 100% responsive.
