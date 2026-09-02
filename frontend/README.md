# ShikshaIQ (शिक्षाIQ) — AI-Powered Competitive Exam Preparation Platform

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Frontend%20Live-black?style=flat&logo=vercel)](https://shiksha-iq-omega.vercel.app)
[![Render Backend](https://img.shields.io/badge/Render-Backend%20API-46E3B7?style=flat&logo=render)](https://render.com)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![Gemini API](https://img.shields.io/badge/Gemini%20AI-3.6%20Flash-8E75B2?style=flat&logo=google)](https://ai.google.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-blueviolet?style=flat&logo=pwa)](https://web.dev/progressive-web-apps)

**ShikshaIQ** is a full-stack, AI-enhanced competitive exam preparation web platform tailored for Indian government examinations (**SSC CGL/CHSL, Railways RRB NTPC, and Banking**). It combines an authentic exam-simulation arena, deep performance analytics, step-by-step doubt resolution via **Gemini 3.6 Flash**, active formula retention flashcards, and an installable Progressive Web App (PWA) client.

---

## 🌟 Key Features

### 1. Mock Exam Simulation Arena
- Authentic CBT (Computer-Based Test) interface with live countdown timers and section badges.
- Dynamic question palette navigation (Answered, Unanswered, Marked for Review).
- Automatic penalty scoring calculation adhering to competitive exam standards (+2 marks, -0.5 negative mark).
- Immediate post-test scorecard generation and performance metrics.

### 2. Comprehensive Question Review & Solutions
- Detailed solution inspect mode following every test submission.
- Dynamic filtering across **Incorrect**, **Skipped**, and **Correct** responses.
- Step-by-step analytical explanations for each question.

### 3. PDF Scorecard Generation
- Instant client-side PDF compilation powered by `html2canvas` and `jsPDF`.
- Official ShikshaIQ-branded scorecard download containing breakdown metrics, accuracy percentages, and exam metadata.

### 4. AI-Powered Doubt Solver (Gemini 3.6 Flash)
- Instant doubt resolution: aspirants can input problem statements or upload diagram screenshots.
- Structured pedagogical breakdown (Concepts involved $\rightarrow$ Step-by-step derivation $\rightarrow$ Shortcut/Formula).
- Powered by `@google/genai` using `gemini-3.6-flash`.

### 5. AI Personalized 7-Day Study Plan Generator
- Dynamically feeds candidate's mock score and subject-wise accuracy to Gemini.
- Generates a targeted, day-by-day revision schedule with focus areas and daily question targets.

### 6. Interactive 3D Formula Flashcards
- High-frequency revision flashcards covering **Algebra**, **Arithmetic**, **Geometry**, **Trigonometry**, and **Logical Reasoning**.
- 3D perspective flip interaction revealing shortcuts, identities, and exam tips.
- Retention tracking with local storage persistence and progress monitoring.

### 7. Performance Analytics & Live Leaderboards
- Visual growth curves and subject accuracy bar charts using `recharts`.
- Real-time All-India ranking with top-3 podium highlights and personal rank positioning.

### 8. Progressive Web App (PWA)
- Installable on Android (Chrome/Edge) and iOS (Safari).
- Service worker precaching (`sw.js`) and web app manifest configuration for offline responsiveness and mobile full-screen operation.

---

## 🏗️ Architecture & Technology Stack

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18+ or v20+
- **npm** or **yarn**
- **MongoDB Atlas** cluster connection URI
- **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone [https://github.com/](https://github.com/)<your-username>/ShikshaIQ.git
cd ShikshaIQ

API Reference SummaryMethodEndpointAccessDescriptionPOST/api/auth/registerPublicRegister new aspirant profilePOST/api/auth/loginPublicAuthenticate user & return JWTGET/api/auth/meProtectedFetch authenticated user detailsGET/api/questionsPublicFetch test questions (supports ?limit=&subject=&exam=)POST/api/questionsAdminAdd new PYQ question with options & explanationPOST/api/tests/submitProtectedSubmit test responses & compute scorecardGET/api/leaderboardPublicRetrieve All-India rank standingsPOST/api/doubts/solveProtectedQuery Gemini 3.6 Flash for doubt solutionsPOST/api/study-plan/generateProtectedGenerate AI-driven 7-day study timetableGET/api/current-affairsPublicFetch daily current affairs capsulesGET/api/jobsPublicRetrieve active government job notifications🔒 Security Best Practices ImplementedPasswords salted and hashed via bcryptjs.Stateless authorization via JSON Web Tokens (Bearer <token>).Strict Cross-Origin Resource Sharing (cors) policy.Environment variable separation across development and production stages.

License
This project is open source and available under the MIT License.


---

### Step 2: Push to GitHub

Commit the new README to your repository:

```powershell
cd C:\Projects\ShikshaIQ
git add README.md
git commit -m "Add comprehensive production README documentation"
git push origin main
Your GitHub repository now has complete architecture diagrams, feature explanations, API specs, and setup instructions.