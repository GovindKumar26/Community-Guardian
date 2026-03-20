# Tech Demo: Video Script & Storyboard (5-7 Minutes)

Use this script to guide your screen recording. It covers all the judging requirements: Problem/Solution, Tech Stack, AI Features, Fallbacks, Tests, and Learnings.

---

## 0:00 - 1:00 | Intro & Problem Statement
*   **Visual**: Dashboard (Start here).
*   **Audio**: "Hi, I'm [Your Name], and this is **Community Guardian**. Most safety apps focus on 'fear-based engagement,' leading to alert fatigue and anxiety. Our solution shifts the focus from 'seeing crime' to 'feeling empowered.' We use a calm, glassmorphic UI and AI-driven actionable steps to turn every incident into a plan."

## 1:00 - 2:00 | Tech Stack & Architecture
*   **Visual**: design_documentation.md or package.json.
*   **Audio**: "Technically, this is a MERN-adjacent stack—React 18 with TypeScript on the frontend, and Node.js with MongoDB on the backend. We chose **Google Gemini 2.5 Flash** for its speed/accuracy in processing safety data. For security, we use HTTP-Only cookies for auth, and AES-256 for encrypted messaging."

## 2:00 - 3:30 | Live Demo: Core Flow & AI Enrichment
*   **Visual**: Click into an Alert (e.g., 'Power Outage').
*   **Audio**: "When a user submits an incident, our AI doesn't just categorize it. It generates a **context-aware checklist** and a **calm summary**. For example, here's a power outage report—the AI automatically identifies the category and generates 5 specific safety steps. This turns a scary alert into a to-do list."
*   **Action**: Click **Verify** or **Flag**.
*   **Audio**: "Notice our community vouching system. We trust our neighbors—3 verifications make an alert official, while 3 flags send it into high-risk review."

## 3:30 - 4:30 | The AI Feature & Fallback
*   **Visual**: Toggle your GEMINI_API_KEY (or just show the badge 'Rule-Based').
*   **Audio**: "Reliability is key. If the Gemini API is unreachable, we have a robust **Rule-Based Fallback** system. Every piece of AI output is transparently tagged with an 'AI-Generated' or 'Rule-Based' badge, so the user always knows the source of their data."

## 4:30 - 5:30 | Security: Scam Sense & Honeypots
*   **Visual**: Show an alert with a 'Under Review' status or the AuthContext code for the Honeypot.
*   **Audio**: "To keep our platform safe from bad actors, we built **AI Scam Sense**. Gemini proactively scans reports for phishing or scams—if it detects a high risk, the alert is instantly hidden and flagged for moderation. We also use a **Stealth Honeypot** during registration to block automated bot accounts without them even knowing."

## 5:30 - 6:30 | Tests & Implementation Rigor
*   **Visual**: Open your terminal and run npm test in the server/ folder.
*   **Audio**: "We've implemented 14 comprehensive tests using Jest and Supertest. These verify everything from our encryption layers to our AI fallback logic. This ensures our critical safety platform is resilient and production-ready."

## 6:30 - 7:00 | Trade-offs & Conclusion
*   **Visual**: Dashboard 'Neighborhood Score'.
*   **Audio**: "One major trade-off was **Privacy vs. Precision**. Most safety apps require intrusive GPS tracking. We chose a **Zero-Tracking** model based on neighborhood selection—achieving high contextual relevance without compromising user privacy. Community Guardian isn't just an app; it's a blueprint for ethical, AI-powered community safety. Thanks for watching!"

---

### Recording Tips:
1.  **Audio Quality**: Use a decent mic in a quiet room. Judges score technical behavior, but clarity is key.
2.  **Smooth Flow**: Practice the "Clicking" sequence (Dashboard -> Alert -> Verify -> Safe Circle) twice before recording.
3.  **Impact Dashboard**: Keep the 'Neighborhood Score' visible as your 'Home Base'—it’s visually stunning and communicates 'Safety' instantly.
