# ElevAI
## AI-Powered Smart Interview & Career Preparation Portal

---

# 1. PROJECT OVERVIEW

### Project Name
**ElevAI**

### Tagline
**Your Career, Elevated.**

### What is ElevAI?
ElevAI is a full-stack, AI-powered career enablement and recruitment management platform. It solves the critical disconnect between job seekers preparing their credentials and hiring teams evaluating candidate talent. By combining Google Gemini generative AI with real-time database-driven workflows, ElevAI provides candidates with tailored resume analysis, quantifiable bullet improvements, role-specific job optimization, mock interview simulations, and single-click job application tracking.

For recruiters and administrators, ElevAI delivers an integrated recruitment control suite: posting job requisitions, reviewing candidate dossiers with score snapshots, managing private recruiter evaluation notes, recording recruitment status transitions (`SUBMITTED` $\to$ `SELECTED`), and monitoring factual recruitment analytics directly from PostgreSQL.

### Functional Matrix at a Glance

| Functional Domain | Key Capabilities Delivered by ElevAI |
| :--- | :--- |
| **Resume Intelligence** | Multi-format PDF/DOCX text extraction, ATS scoring (0–100), section-level feedback, and metric-driven bullet revisions. |
| **Skill Alignment** | Role readiness evaluation, missing competencies identification, and prioritized learning roadmaps. |
| **Mock Interview** | Interactive technical, behavioral, and mixed question simulations with instant scoring across technical relevance and communication clarity. |
| **Job Market Feed** | Multi-filter job search (Work Mode, Employment Type, Experience), requisition details, and deadline tracking. |
| **Job Applications** | Single-click application submission with resume & match score snapshots, duplicate protection, and live status tracking. |
| **AI Assistant** | General conversational career guidance chatbot with profile and career goal context awareness. |
| **Admin Control** | Job lifecycle management (Draft, Publish, Close), candidate review dossier, private recruiter notes, and audit history. |
| **Analytics Engine** | Live PostgreSQL aggregations: 7d/30d continuous application trends, skill demand rankings, and deadline urgency radars. |

---

# 2. WHAT PROBLEM DOES ELEVAI SOLVE?

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CORE PROBLEMS SOLVED                                   │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ 📄 Generic Resumes       │ 🔍 Skill Blindspots      │ 🎙️ Unaffordable Mock Coaching    │
│ Candidates submit static │ Job descriptions are     │ Personalized technical and       │
│ resumes that fail ATS    │ broad; applicants don't  │ behavioral interview coaching is │
│ screening algorithms.    │ know exact missing tech. │ costly and inaccessible.         │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ 🎯 Job Incompatibility   │ 📋 Fragmented Tracking   │ 🏢 Disorganized Hiring           │
│ Manual reading doesn't   │ Spreadsheets and lost    │ Employers struggle to filter     │
│ reveal keyword gaps or   │ emails make application  │ applicants by verified skill fit │
│ mathematical match score.│ tracking frustrating.    │ and manage candidate pipelines.  │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

* **Generic Resumes**: ElevAI provides an AI Resume Improver that rewires passive bullet points into the Google X-Y-Z formula ("Accomplished [X], measured by [Y], by doing [Z]") while preserving original user text.
* **Skill Blindspots**: The Skill Gap Analyzer inspects candidate resumes against target role benchmarks to pinpoint critical missing tools and technologies.
* **Interview Practice Gap**: The AI Mock Interview Simulator conducts realistic multi-question rounds with instant feedback and reference answers.
* **Opaque Job Fit**: The Job Optimization engine computes mathematical match scores (0–100%) against target job requisitions before applying.
* **Recruitment Inefficiencies**: The Admin Panel replaces manual spreadsheets with centralized candidate review dossiers, private recruiter notes, and automated status audit trails.

---

# 3. ELEVAI AT A GLANCE

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                ELEVAI ARCHITECTURE FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│     [ CANDIDATE / USER ]                             [ RECRUITER / ADMIN ]              │
│       │                                                │                                │
│       ▼                                                ▼                                │
│  React 18 SPA (Vite + Tailwind CSS)               Admin Control Layout (Protected RBAC) │
│       │                                                │                                │
│       └───────────────────────┬────────────────────────┘                                │
│                               │ HTTPS / REST (Axios + JWT Interceptors)                 │
│                               ▼                                                         │
│                   Express.js Backend (Node.js)                                          │
│                               │                                                         │
│     ┌─────────────────────────┼─────────────────────────┐                               │
│     ▼                         ▼                         ▼                               │
│  [ Auth & RBAC ]        [ AI Service Engine ]    [ Core Business Logic ]                │
│  - JWT Verification     - Google Gemini API      - Job Lifecycle (Draft/Pub/Close)      │
│  - Bcrypt Hashing       - Dual Offline Fallback  - Applications & Status History        │
│  - UUID Param Guards    - Structured JSON Parser - Notifications & Private Notes        │
│     │                         │                         │                               │
│     └─────────────────────────┼─────────────────────────┘                               │
│                               │                                                         │
│                               ▼                                                         │
│                         Prisma ORM v6                                                   │
│                               │                                                         │
│               ┌───────────────┴───────────────┐                                         │
│               ▼                               ▼                                         │
│     Supabase PostgreSQL              Supabase Storage                                   │
│     (12 Relational Tables)           (Private 'resumes' Bucket)                         │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 4. TECHNOLOGY STACK

| Layer / Tool | Technology | Version | Purpose in ElevAI |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React.js | `^18.3.1` | Component-based, responsive Single Page Application (SPA). |
| **Language** | JavaScript (ES6+) | ECMAScript 2023 | Universal runtime language across client and server. |
| **Styling** | Tailwind CSS | `^4.0.7` | Utility-first styling for dark glassmorphic cyber theme. |
| **Client Routing** | React Router DOM | `^7.1.5` | Client-side routing with `ProtectedRoute` and `AdminRoute`. |
| **Build Tool** | Vite | `^6.1.0` | High-speed bundler and production optimizer. |
| **Data Charts** | Recharts | `^2.15.1` | Renders dynamic trend charts, score gauges, and funnel graphs. |
| **Backend Framework**| Express.js | `^4.21.2` | RESTful API server with centralized middleware pipeline. |
| **Backend Runtime** | Node.js | `v20+` / `v25.x` | Asynchronous event-driven server runtime environment. |
| **Database ORM** | Prisma ORM | `^6.3.1` | PostgreSQL schema modeling, migrations, and query engine. |
| **Database Engine** | PostgreSQL (Supabase)| PostgreSQL 15+ | Relational cloud database storing system models and audit logs. |
| **Object Storage** | Supabase Storage | `@supabase/supabase-js ^2.48.1` | Secure private cloud bucket for candidate resume documents. |
| **Generative AI** | Google Gemini API | `@google/genai ^2.17.1` | LLM service (`gemini-2.0-flash`) for career intelligence. |
| **Authentication** | JSON Web Tokens (JWT)| `jsonwebtoken ^9.0.2` | Cryptographically signed stateless session tokens. |
| **Password Security**| Bcrypt.js | `bcryptjs ^2.4.3` | Salted cryptographic password hashing (10 rounds). |
| **File Processing** | Multer, PDF-Parse, Mammoth | `multer ^1.4.5`, `pdf-parse ^1.1.1` | Multipart uploads and server-side text extraction. |

---

# 5. SYSTEM ARCHITECTURE

ElevAI implements a modular **Three-Tier Decoupled Architecture**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. PRESENTATION LAYER (React 18 SPA)                                                    │
│    • Public Views: Landing Page, Login, Register, Public Job Feed.                      │
│    • User Workspace: Dashboard, Resume Analyzer, Improver, Builder, Mock Interview.     │
│    • Admin Portal: Overview, Job Creator/Editor, Candidate Review Dossier, Analytics.  │
│    • Axios HTTP Client: Automatically injects Authorization: Bearer <JWT> headers.       │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │ REST API / JSON Payloads
┌───────────────────────────────────────────▼─────────────────────────────────────────────┐
│ 2. APPLICATION & SECURITY LAYER (Express.js & Node.js)                                  │
│    • Security Headers: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, CORS.    │
│    • Middleware Pipeline: Auth token verification, requireAdmin RBAC, validateUUID.     │
│    • Resilient AI Engine: Dual-layer system (Live Gemini 2.0 + Offline Heuristic Fallback)│
│    • Error Sanitizer: Masks internal database strings and stack traces in production.   │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │ SQL Queries & Object API
┌───────────────────────────────────────────▼─────────────────────────────────────────────┐
│ 3. PERSISTENCE & CLOUD SERVICES LAYER                                                   │
│    • Supabase PostgreSQL: 12 relational tables with foreign keys and cascade rules.     │
│    • Supabase Storage: Private 'resumes' bucket with server-generated signed URLs.      │
│    • Google Gemini Cloud: Generative language models for career text processing.        │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 6. USERS & ROLES

ElevAI enforces strict server-side Role-Based Access Control (RBAC):

```text
┌─────────────────────────────────────────────┬─────────────────────────────────────────────┐
│ 👤 CANDIDATE / USER ROLE                    │ 🛡️ RECRUITER / ADMIN ROLE                   │
├─────────────────────────────────────────────┼─────────────────────────────────────────────┤
│ • Set career goals & target experience      │ • Access Admin Control Dashboard            │
│ • Upload PDF/DOCX resumes to private vault  │ • Create, Draft, Publish & Close Jobs       │
│ • Run AI ATS Resume Analysis (0–100 Score)  │ • Set salary bands & application deadlines  │
│ • Generate X-Y-Z Resume Content Improvements│ • Inspect candidate review dossiers         │
│ • Optimize resumes against job descriptions │ • Generate signed links for candidate resume│
│ • Practice AI Mock Interviews (Text/Voice)  │ • Record private recruiter evaluation notes │
│ • Build resumes with interactive templates  │ • Transition candidate recruitment statuses │
│ • Browse published jobs & submit application│ • Inspect status transition audit histories │
│ • Track live application status pipeline    │ • Monitor real PostgreSQL analytics engine  │
│ • Receive targeted job & status alerts      │ • Broadcast targeted candidate notifications│
└─────────────────────────────────────────────┴─────────────────────────────────────────────┘
```

---

# 7. COMPLETE USER JOURNEY

```text
[ 1. REGISTER / LOGIN ] ────► Create account with secure bcrypt & receive signed JWT session.
           │
           ▼
[ 2. SET CAREER GOAL ] ─────► Define target role (e.g. "Cloud Engineer") & experience level.
           │
           ▼
[ 3. UPLOAD RESUME ] ───────► Upload PDF/DOCX; server extracts text and saves to private vault.
           │
           ▼
[ 4. AI RESUME ANALYSIS ] ──► Receive ATS Score (0–100), section breakdowns & skill inventory.
           │
           ▼
[ 5. IMPROVE RESUME ] ──────► Review AI bullet-point rewrites formatted in Google X-Y-Z style.
           │
           ▼
[ 6. BROWSE JOBS ] ─────────► Search published requisitions filtered by role, type & location.
           │
           ▼
[ 7. JOB OPTIMIZATION ] ────► Compare resume vs job description to get match score & missing tech.
           │
           ▼
[ 8. SUBMIT APPLICATION ] ──► Apply in 1 click; snapshot of resume & match score is stored.
           │
           ▼
[ 9. TRACK STATUS ] ────────► Monitor pipeline: SUBMITTED ➔ UNDER_REVIEW ➔ INTERVIEW ➔ SELECTED.
```

---

# 8. AI FEATURES SUITE

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ELEVAI AI INTELLIGENCE                                  │
├──────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│ 📊 AI Resume Analyzer    │ ✍️ AI Resume Improver    │ 🎯 Job-Specific Optimizer         │
│ Input : Extracted Resume │ Input : Analysis ID      │ Input : Resume + Job Description  │
│ Process: ATS evaluation  │ Process: X-Y-Z rewrite   │ Process: Keyword overlap & fit    │
│ Output: Overall 0–100,   │ Output: Original vs New  │ Output: Match % (0–100), missing  │
│ section scores & skills. │ bullets + explanations.  │ skills & priority suggestions.    │
├──────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ 🧭 Skill Gap Analyzer    │ 🎙️ AI Mock Interview     │ 💬 General Career Assistant       │
│ Input : Resume + Goal    │ Input : Role & Difficulty│ Input : Freeform User Query       │
│ Process: Benchmark diff  │ Process: Q&A evaluation  │ Process: Profile context memory   │
│ Output: Readiness %, gap │ Output: Multi-round score│ Output: Structured guidance &     │
│ list & learning roadmap. │ + ideal reference answer.│ debugging assistance.             │
└──────────────────────────┴──────────────────────────┴───────────────────────────────────┘
```

### Fault-Tolerant AI Engine (100% Availability)
ElevAI integrates an automated **Dual-Layer Resilience Engine**:
1. **Primary Layer**: Directly communicates with Google Gemini API (`gemini-2.0-flash`) using structured JSON prompts.
2. **Resilient Heuristic Fallback Layer**: If upstream API rate limits (`HTTP 429 RESOURCE_EXHAUSTED` or `503 UNAVAILABLE`) occur, ElevAI automatically executes local rule-based heuristic algorithms that calculate keyword density, skill coverage, and ATS formatting, returning structured data without crashing or degrading user experience.

---

# 9. RESUME SYSTEM & VAULT

```text
[ UPLOAD FILE ] ────► [ SERVER EXTRACTION ] ────► [ PRIVATE VAULT ] ────► [ APPLICATION LOCK ]
(PDF / DOCX <= 5MB)   (pdf-parse / mammoth)       (Supabase Storage)       (Protected if applied)
```

* **Multi-Format Ingestion**: Supports `.pdf`, `.docx`, `.doc`, and `.txt` up to 5MB.
* **Server-Side Extraction**: Sanitizes raw text buffer, strips binary artifacts, and populates `Resume.extractedText`.
* **Private Cloud Isolation**: File stored under `storagePath = ${userId}/${resumeId}/${sanitizedName}` in private Supabase Storage.
* **Interactive Resume Builder**: Drag-and-drop section ordering, ATS preview, and direct **Export to Vault** generating a compliant resume record.
* **Deletion Safety Guard**: Resumes linked to active submitted applications cannot be deleted, preserving audit integrity for recruiters.

---

# 10. JOB & RECRUITMENT SYSTEM

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              RECRUITMENT WORKFLOW STAGES                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [ ADMIN: CREATE & PUBLISH ] ──► Job Requisition created with required skills & dates. │
│               │                                                                        │
│               ▼                                                                        │
│  [ TARGETED NOTIFICATION ]  ──► Candidates with matching target roles receive alert.   │
│               │                                                                        │
│               ▼                                                                        │
│  [ CANDIDATE OPTIMIZE & APPLY ]► Candidate evaluates fit and submits application.      │
│               │                                                                        │
│               ▼                                                                        │
│  [ ADMIN DOSSIER REVIEW ]   ──► Admin views profile, score snapshot & signed resume link│
│               │                                                                        │
│               ▼                                                                        │
│  [ STATUS PIPELINE UPDATE ] ──► Admin transitions status (e.g. SHORTLISTED / SELECTED).│
│               │                                                                        │
│               ▼                                                                        │
│  [ CANDIDATE NOTIFICATION ] ──► Candidate receives real-time notification on decision. │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 11. ADMIN CONTROL PANEL

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ADMIN CONTROL CAPABILITIES                                │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ 📈 Overview Telemetry    │ 📝 Job Management        │ 👥 Candidate Applications        │
│ Total users, published   │ Create drafts, publish   │ Review candidate dossiers,       │
│ jobs, pending reviews &  │ requisitions, set salary │ inspect match scores & download  │
│ application counts.      │ bands & close postings.  │ attached resumes securely.       │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ 🔒 Private Recruiter Note│ 🔄 Status Pipeline Audit │ 📊 Real Analytics Engine         │
│ Record internal candidate│ Log immutable status     │ Continuous 7d/30d submission     │
│ evaluations (hidden from │ transitions with change  │ trends, skill demand ranking, and│
│ candidate API responses).│ timestamp and notes.     │ deadline urgency radar.          │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

---

# 12. APPLICATION STATUS PIPELINE

ElevAI enforces a 6-stage candidate progression pipeline:

```text
               ┌───────────────┐
               │   SUBMITTED   │  (Candidate submits application)
               └───────┬───────┘
                       ▼
               ┌───────────────┐
               │ UNDER REVIEW  │  (Recruiter opens candidate dossier)
               └───────┬───────┘
                       ▼
               ┌───────────────┐
               │  SHORTLISTED  │  (Candidate meets technical criteria)
               └───────┬───────┘
                       ▼
               ┌───────────────┐
               │   INTERVIEW   │  (Technical / HR rounds scheduled)
               └───────┬───────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
  ┌───────────────┐         ┌───────────────┐
  │   SELECTED    │         │   REJECTED    │  (Final Outcome)
  └───────────────┘         └───────────────┘
```

* **Audit Trail**: Every transition creates an immutable `ApplicationStatusHistory` event logging `oldStatus`, `newStatus`, `changedById`, and timestamp.

---

# 13. DATABASE DESIGN & ENTITIES

ElevAI operates on **12 Relational Tables** in Supabase PostgreSQL:

| Entity Name | Primary Purpose in ElevAI | Key Foreign Keys & Constraints |
| :--- | :--- | :--- |
| `User` | Authenticated users and role assignments (`USER`, `ADMIN`). | Primary Key: `id` (UUID), `email` (Unique). |
| `CareerGoal` | Target career role and experience level. | `userId` $\to$ `User.id` (Unique, 1-to-1). |
| `Resume` | Uploaded resume files, text buffer & vault status. | `userId` $\to$ `User.id` (Cascade). |
| `ResumeAnalysis` | AI ATS score (0–100), strengths, and section scores. | `resumeId` $\to$ `Resume.id`, `userId` $\to$ `User.id`. |
| `ResumeImprovement` | Bullet-by-bullet X-Y-Z content improvements. | `resumeId` $\to$ `Resume.id`, `analysisId` $\to$ `Analysis.id`. |
| `JobOptimization` | Role-specific match score and missing keywords. | `resumeId` $\to$ `Resume.id`, `userId` $\to$ `User.id`. |
| `SkillGapAnalysis` | Role readiness score and prioritized learning gaps. | `resumeId` $\to$ `Resume.id`, `userId` $\to$ `User.id`. |
| `InterviewSession` | AI Mock interview session metadata and overall score.| `userId` $\to$ `User.id`, `careerGoalId` $\to$ `Goal.id`. |
| `Job` | Admin job postings, requirements, and deadlines. | `createdBy` $\to$ `User.id`, Indexed by `status`. |
| `Application` | Candidate job submission with score snapshot. | Unique constraint on `[jobId, userId]`. |
| `ApplicationStatusHistory`| Immutable audit log of status transitions. | `applicationId` $\to$ `Application.id` (Cascade). |
| `ApplicationNote` | Private recruiter evaluation notes. | `applicationId` $\to$ `Application.id`, `adminId` $\to$ `User.id`. |

---

# 14. REST API OVERVIEW

ElevAI exposes a modular, authenticated REST API under `/api/*`:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               CORE REST API ENDPOINTS                                  │
├───────────────────┬──────────────────────────────────┬──────────────┬──────────────────┤
│ Module            │ Endpoint                         │ Method       │ Access Role      │
├───────────────────┼──────────────────────────────────┼──────────────┼──────────────────┤
│ Authentication    │ /api/auth/register               │ POST         │ Public           │
│                   │ /api/auth/login                  │ POST         │ Public           │
│                   │ /api/auth/me                     │ GET          │ Authenticated    │
├───────────────────┼──────────────────────────────────┼──────────────┼──────────────────┤
│ System Health     │ /api/health                      │ GET          │ Public           │
│                   │ /api/health/ai-status            │ GET          │ Public           │
├───────────────────┼──────────────────────────────────┼──────────────┼──────────────────┤
│ Resumes & AI      │ /api/resumes                     │ POST, GET    │ USER             │
│                   │ /api/resumes/:id/download        │ GET (Signed) │ USER / Owner     │
│                   │ /api/resumes/:id/analyze         │ POST         │ USER             │
│                   │ /api/resumes/:id/improve         │ POST         │ USER             │
│                   │ /api/job-optimization            │ POST, GET    │ USER             │
│                   │ /api/skill-gap                   │ POST, GET    │ USER             │
│                   │ /api/interviews                  │ POST, GET    │ USER             │
├───────────────────┼──────────────────────────────────┼──────────────┼──────────────────┤
│ Jobs & Apply      │ /api/jobs                        │ GET          │ Public / USER    │
│                   │ /api/jobs/:id                    │ GET          │ Public / USER    │
│                   │ /api/applications                │ POST, GET    │ USER             │
│                   │ /api/applications/:id            │ GET          │ USER / Owner     │
├───────────────────┼──────────────────────────────────┼──────────────┼──────────────────┤
│ Admin & Analytics │ /api/admin/overview              │ GET          │ ADMIN            │
│                   │ /api/admin/jobs                  │ POST, GET    │ ADMIN            │
│                   │ /api/admin/jobs/:id/status       │ PATCH        │ ADMIN            │
│                   │ /api/admin/applications          │ GET          │ ADMIN            │
│                   │ /api/admin/applications/:id      │ GET          │ ADMIN            │
│                   │ /api/admin/applications/:id/status│ PATCH       │ ADMIN            │
│                   │ /api/admin/applications/:id/notes │ POST, DELETE │ ADMIN            │
│                   │ /api/admin/analytics/overview    │ GET          │ ADMIN            │
│                   │ /api/admin/analytics/trends      │ GET          │ ADMIN            │
│                   │ /api/admin/analytics/skills      │ GET          │ ADMIN            │
│                   │ /api/admin/analytics/deadlines   │ GET          │ ADMIN            │
└───────────────────┴──────────────────────────────────┴──────────────┴──────────────────┘
```

---

# 15. SECURITY & HARDENING

ElevAI implements multi-layered security protections:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             SECURITY HARDENING CHECKLIST                               │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ ✅ Cryptographic Hashing │ ✅ Stateless JWT RBAC    │ ✅ IDOR Elimination             │
│ Passwords hashed with    │ Server-side middleware   │ Queries scoped by authenticated  │
│ bcrypt (10 salt rounds). │ validates 'ADMIN' role.  │ userId; cross-tenant blocked.    │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ ✅ Parameter Hardening   │ ✅ Private Cloud Storage │ ✅ Secrets Isolation             │
│ RFC 4122 UUID validation │ Supabase bucket private; │ Zero API keys or tokens exposed  │
│ blocks SQLi & traversal. │ signed 1-hour URLs only. │ to frontend bundle.              │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

---

# 16. NOTIFICATIONS SYSTEM

ElevAI routes real-time multi-tenant notifications:

```text
[ SYSTEM EVENT OCCURS ]
  ├── Admin publishes matching job ──────► "New Matching Job: Senior Cloud Engineer"
  ├── Application status updated ────────► "Status Updated: SHORTLISTED for Cloud Engineer"
  └── Recruiter adds note / interview ───► "Review Update on your application"
          │
          ▼
[ NOTIFICATION DISPATCH ] ────────► Saved to DB with userId, read status (isRead: false).
          │
          ▼
[ CLIENT NOTIFICATION CENTER ] ──► Real-time bell badge count, mark-as-read & deep-linking.
```

---

# 17. RECRUITMENT ANALYTICS ENGINE

The Recruitment Analytics Engine computes telemetry directly from PostgreSQL without synthetic data:

* **30-Day Trend Calculation**: Continuous daily date buckets ensuring empty submission days reflect 0.
* **Recruiter Conversion Funnel**: Percentage progression from `SUBMITTED` $\to$ `UNDER_REVIEW` $\to$ `SHORTLISTED` $\to$ `SELECTED`.
* **Skill Demand Extraction**: Aggregates in-demand skills from active job postings.
* **Deadline Radar**: Highlights postings expiring in $\le$ 3 days, $\le$ 7 days, and expired jobs.

---

# 18. UI/UX DESIGN SYSTEM

ElevAI features a cohesive **Futuristic Cyber Glassmorphism** design language:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DESIGN SPECIFICATIONS                                  │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ 🎨 Dark Color Palette    │ 🔮 Glassmorphism Cards   │ ⚡ Interactive Micro-animations │
│ Deep Slate (#0A0E17),    │ Translucent backgrounds, │ Hover glow transitions, smooth   │
│ Cyber Cyan (#06B6D4),    │ 1px subtle borders, and  │ score meter progressions, and    │
│ Indigo Purple (#6366F1). │ soft backdrop blurs.     │ dynamic status pill badges.      │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

---

# 19. PROJECT STRUCTURE

```text
ElevAI/
├── client/                               # React 18 Frontend SPA
│   ├── public/
│   │   └── _redirects                    # SPA redirect fallback for Render / Netlify
│   ├── src/
│   │   ├── components/                   # Navbar, ProtectedRoute, AdminRoute, Toasts, Gauges
│   │   ├── context/                      # AuthContext.jsx (JWT session state)
│   │   ├── layouts/                      # RootLayout, DashboardLayout, AdminLayout
│   │   ├── pages/                        # Dashboard, Upload, Analyzer, Jobs, Applications
│   │   │   └── admin/                    # Admin Dashboard, Jobs List/Create, Candidate Review
│   │   ├── services/                     # Centralized Axios API client (api.js)
│   │   └── App.jsx                       # Master React Router DOM Route Map
│   ├── package.json
│   └── vite.config.js
│
├── server/                               # Node.js Express Backend REST API
│   ├── prisma/
│   │   └── schema.prisma                 # Master PostgreSQL Database Schema
│   ├── src/
│   │   ├── ai/geminiService.js           # Gemini API client & Heuristic Fallback Engine
│   │   ├── config/                       # database.js, supabase.js, env.js
│   │   ├── controllers/                  # Auth, Jobs, Applications, AI, Analytics Controllers
│   │   ├── middleware/                   # JWT Auth, Role RBAC, UUID Validator, Error Handler
│   │   ├── routes/                       # Modular Express Routes mounted at /api/*
│   │   ├── services/                     # Application, Resume, Analytics, Storage Services
│   │   ├── app.js                        # Express App, CORS, Security Headers
│   │   └── server.js                     # Server Listener Entrypoint
│   ├── scripts/                          # Master 13-Phase Verification Test Suites
│   └── package.json
│
├── .env.example                          # Parameterized Environment Template (No Secrets)
├── .gitignore                            # Exclusion rules for secrets & build outputs
├── render.yaml                           # Master Render Infrastructure as Code Blueprint
└── README.md
```

---

# 20. TESTING & VERIFICATION SUMMARY

Every operational domain was programmatically verified against live database and runtime endpoints:

| Verification Domain | Automated Test Scope | Result | Verified Status |
| :--- | :--- | :---: | :---: |
| **Authentication & Credentials** | Registration validation, bcrypt hashing, JWT issuance/tamper rejection | 8 / 8 | **PASS** |
| **Admin RBAC Enforcement** | Anonymous 401, candidate 403, admin access approval | 3 / 3 | **PASS** |
| **Resume Pipeline & Vault** | MIME validation, 5MB limit, signed downloads, deletion locks | 7 / 7 | **PASS** |
| **AI Resilience & Fallbacks** | Structured scoring, rate spike fault tolerance, prompt protection | 4 / 4 | **PASS** |
| **Job Lifecycle & Deadlines** | Draft feed invisibility, publish flow, closed/expired apply blocks | 6 / 6 | **PASS** |
| **Candidate Applications** | Submission with score snapshot, duplicate 409 rejection, status tracking | 6 / 6 | **PASS** |
| **Admin Review & Notes** | Candidate dossier review, private notes CRUD, status audit history | 9 / 9 | **PASS** |
| **Recruitment Analytics** | Real database queries, continuous 7d/30d trend lines, skill rankings | 5 / 5 | **PASS** |
| **Parameter Hardening** | RFC 4122 UUID validation, SQL injection & path traversal rejections | 5 / 5 | **PASS** |
| **Client Production Build** | Vite production bundle compilation (0 syntax or bundling errors) | 1 / 1 | **PASS** |
| **TOTAL VERIFIED CHECKS** | **Complete Full-Stack Operational Lifecycle** | **54 / 54** | **PASS (100%)** |

---

# 21. CURRENT LIMITATIONS

1. **AI Free-Tier Rate Limits**: Upstream free-tier Google Gemini API keys are limited to 20 requests/day. While ElevAI's offline fallback engine prevents crashes, paid Gemini plans are recommended for high-volume enterprise usage.
2. **Browser Voice Support**: Voice input during mock interviews uses the browser Web Speech API (Google Chrome / Edge recommended).

---

# 22. FUTURE SCOPE

* **Automated Email & SMS Alerts**: Integration with SendGrid or AWS SES for out-of-band email notifications when application statuses update.
* **Integrated WebRTC Video Interviews**: Direct browser-to-browser video conferencing embedded within candidate dossiers.
* **Bulk Candidate Processing**: Multi-resume batch uploads and automated resume ranking for enterprise recruiters.
* **Native Mobile Apps**: Cross-platform React Native mobile applications for iOS and Android.

---

# 23. CONCLUSION

**ElevAI** delivers a comprehensive, modern, and resilient AI-powered career preparation and recruitment management portal. By integrating AI resume evaluation, metric-driven bullet improvement, role-specific job optimization, and mock interview practice with an administrative recruitment workflow, ElevAI removes friction for both job seekers and hiring teams.

Built with a clean decoupled architecture (React 18 + Node/Express + Prisma + Supabase + Gemini AI), strict server-side RBAC, and resilient offline fallback engines, ElevAI represents a robust, production-ready software project.

---

# 24. APPENDIX

### A. Environment Configuration Parameters (Names Only)
* `PORT`, `NODE_ENV`, `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLIENT_URL`, `VITE_API_BASE_URL`.

### B. Core Status Enums
* **JobStatus**: `DRAFT`, `PUBLISHED`, `CLOSED`.
* **ApplicationStatus**: `SUBMITTED`, `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`.
* **InterviewType**: `TECHNICAL`, `HR`, `MIXED`.
