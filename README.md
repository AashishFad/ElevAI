<div align="center">

  <img src="client/public/logo.png" alt="ElevAI Logo" width="100" height="100" style="border-radius: 20px; margin-bottom: 16px;" />

  # ElevAI
  ### Intelligent Career Enablement & Recruitment Automation Platform

  [![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Ollama](https://img.shields.io/badge/Ollama-Qwen2.5:7B-FF6F00?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

  <p align="center">
    <strong>ElevAI</strong> bridges the gap between job seekers and recruitment teams. Candidates get real-time AI resume analysis, ATS job match scoring, and interactive mock interviews; recruiters manage requisitions, review candidate dossiers with score snapshots, and drive hiring pipelines.
  </p>

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-environment-variables">Configuration</a> •
    <a href="#-api-reference">API Reference</a>
  </p>

</div>

---

## 📌 Overview

Traditional recruitment platforms suffer from two major disconnects:
1. **Candidates** submit static resumes into opaque Applicant Tracking Systems (ATS) without understanding skill gaps, match percentages, or how to prepare for interviews.
2. **Recruiters** are overwhelmed by unsifted applicants, lack structured match metrics, and rely on fragmented spreadsheets to track stages.

**ElevAI** solves this with an end-to-end, privacy-conscious recruitment platform featuring:
- **Local AI Engine**: Powered by **Ollama (`qwen2.5:7b`)**, executing all AI evaluations locally with zero cloud API token costs, low latency, and deterministic fallback calculations.
- **Dual Persona Workspaces**: Dedicated candidate and recruiter onboarding, portals, and role-based permissions.
- **Actionable ATS Scoring**: Deep multi-format resume parsing (`.pdf`, `.docx`) calculating matched skills, missing skills, and granular alignment scores.
- **Interactive Mock Interviewer**: Multi-turn technical and behavioral interview sessions with automated feedback and answer evaluations.
- **Complete Hiring Pipeline**: Single-click applications with resume snapshots, duplicate prevention, and real-time status synchronization.

---

## ✨ Key Features

### 🎓 Candidate Experience
- **Interactive Role Onboarding**: Choose between Candidate and Recruiter during registration and login, automatically configuring appropriate dashboards.
- **AI-Powered Resume Analysis**:
  - Secure document upload (`PDF`, `DOCX`) with automated text extraction.
  - Multi-dimensional scoring: ATS Compatibility Score, Job Alignment Score, Experience Fit, and Education Evaluation.
  - Skill breakdown: Extracted Skills, Matched Skills, and Missing Critical Competencies.
  - Bullet-by-bullet actionable recommendations.
- **Interactive AI Mock Interviewer**:
  - Practice Technical, HR/Behavioral, or Mixed interview rounds across Beginner, Intermediate, and Advanced difficulty levels.
  - Real-time scoring on technical accuracy, conceptual relevance, and communication clarity.
  - Review ideal sample answers, detailed reasoning, and performance history.
- **Job Feed & One-Click Application**:
  - Browse published positions with filters for Employment Type (`Full-time`, `Part-time`, `Contract`, `Internship`) and Work Mode (`Remote`, `Hybrid`, `Onsite`).
  - Submit applications instantly attaching a selected resume and computed match score.
  - Live tracking of application status: `SUBMITTED` $\to$ `UNDER_REVIEW` $\to$ `SHORTLISTED` $\to$ `INTERVIEW` $\to$ `SELECTED` / `REJECTED`.

### 💼 Recruiter & Admin Workspace
- **Job Requisition Management**: Create, edit, publish, draft, or close job openings with detailed requirements and skill tags.
- **Candidate Dossier & Resume Viewer**:
  - Inspect candidate applications with pre-computed AI match scores and application dates.
  - Direct download and preview of candidate resumes from secure storage.
- **Evaluation & Stage Pipeline**:
  - Record private recruiter evaluation notes and internal ratings.
  - Update candidate stage in real time, notifying the applicant immediately.
- **Recruitment Analytics**: Track application counts, pipeline health, and top required competencies.

---

## 🏗️ System Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   CLIENT (React 18 SPA)                                │
 │  ┌────────────────────────────────────────┐   ┌─────────────────────────────────────┐  │
 │  │        Candidate Dashboard & UI        │   │       Recruiter / Admin Panel       │  │
 │  │  • Job Feed & Search                   │   │  • Requisition Manager (CRUD)       │  │
 │  │  • AI Resume Analyzer (ATS Scoring)    │   │  • Candidate Dossiers & Resumes     │  │
 │  │  • Interactive Mock Interview Room     │   │  • Application Stage Transitions    │  │
 │  │  • Application Status Tracker          │   │  • Pipeline Analytics               │  │
 │  └────────────────────────────────────────┘   └─────────────────────────────────────┘  │
 └───────────────────────────────────────────────┬────────────────────────────────────────┘
                                                 │ HTTPS / REST (Axios + JWT Interceptors)
                                                 ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   BACKEND (Node.js + Express)                          │
 │  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
 │  │  Middleware: JWT Verification | Role-Based Access Control (RBAC) | Rate Limiter  │  │
 │  └──────────────────────────────────────────────────────────────────────────────────┘  │
 │                                               │                                        │
 │         ┌─────────────────────────────────────┼──────────────────────────────────┐     │
 │         ▼                                     ▼                                  ▼     │
 │  [ Business Controllers ]           [ Local AI Engine ]                  [ File Parser ]│
 │  • Auth & User Management           • Ollama Client (qwen2.5:7b)         • pdf-parse   │
 │  • Jobs & Applications Pipeline     • Structured Prompt Parsing          • mammoth     │
 │  • Mock Interview Evaluator         • Deterministic Fallback Matcher     • Multer      │
 │         │                                     │                                  │     │
 │         └─────────────────────────────────────┼──────────────────────────────────┘     │
 │                                               ▼                                        │
 │                                     Prisma ORM (v6) Engine                             │
 └───────────────────────────────────────────────┬────────────────────────────────────────┘
                                                 │
                               ┌─────────────────┴─────────────────┐
                               ▼                                   ▼
                ┌─────────────────────────────┐     ┌─────────────────────────────┐
                │     Supabase PostgreSQL     │     │      Supabase Storage       │
                │  (12 Relational Tables with │     │  (Private 'resumes' Bucket  │
                │   Enums, FKs & Indexing)    │     │   with Secure Download URLs)│
                └─────────────────────────────┘     └─────────────────────────────┘
```

---

## 💻 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 | Single Page Application framework with React Router v6 |
| | Vite 6 | Modern, lightning-fast frontend build tooling |
| | Tailwind CSS | Utility-first styling with custom dark-glass aesthetics |
| | Lucide React | Accessible, clean UI iconography |
| | React Hook Form | High-performance form state management and validation |
| **Backend** | Node.js (v18+) | Server-side JavaScript runtime |
| | Express.js 4 | Scalable REST API with modular routing and controllers |
| | Prisma ORM 6 | Type-safe database queries and automated migrations |
| | Supabase PostgreSQL | Managed relational database with strict foreign keys & enums |
| | Supabase Storage | Encrypted cloud object storage for candidate resumes |
| **Artificial Intelligence** | Ollama (`qwen2.5:7b`)| Local LLM providing fast, private, and deterministic evaluation |
| | Deterministic Scoring | Keyword & TF-IDF algorithmic fallback ensuring zero failures |
| **Security & Auth** | JSON Web Tokens (JWT)| Stateless authorization with role payload validation |
| | Bcrypt.js | Salted password hashing (10 rounds) |
| | RBAC Guards | Server-side role middleware distinguishing `USER` from `ADMIN` |

---

## 📂 Project Structure

```text
ElevAI/
├── client/                          # React Frontend Application
│   ├── public/                      # Static assets & favicon
│   ├── src/
│   │   ├── components/              # Reusable UI & Layout components
│   │   │   ├── application/         # Application modals & cards
│   │   │   ├── common/              # Navbar, Footer, ProtectedRoute, AdminRoute
│   │   │   ├── layout/              # Sidebar & Topbar navigations
│   │   │   └── ui/                  # GlassCard, GradientButton, AIOrb, Alerts
│   │   ├── context/                 # AuthContext & global state providers
│   │   ├── hooks/                   # Custom React hooks (useAuth, etc.)
│   │   ├── layouts/                 # RootLayout, DashboardLayout, AdminLayout
│   │   ├── pages/                   # Application views
│   │   │   ├── admin/               # Recruiter views (Jobs, Applications, Detail)
│   │   │   ├── DashboardPage.jsx    # Candidate primary hub
│   │   │   ├── JobsFeedPage.jsx     # Job search & filter feed
│   │   │   ├── LoginPage.jsx        # Dual-role Login portal
│   │   │   ├── RegisterPage.jsx     # Dual-role Register portal
│   │   │   ├── MockInterviewSessionPage.jsx # Interactive interview room
│   │   │   └── ResumeUploadPage.jsx # Resume upload & AI scoring
│   │   ├── services/                # Axios API client & endpoints
│   │   └── App.jsx                  # Application routing & tree setup
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Node.js + Express Backend
│   ├── prisma/
│   │   └── schema.prisma            # Database schema definitions & enums
│   ├── scripts/                     # Verification & testing scripts
│   ├── src/
│   │   ├── ai/                      # Ollama & AI engine integration
│   │   │   ├── aiService.js         # Prompt orchestration & model calls
│   │   │   └── geminiService.js     # Auxiliary AI engine
│   │   ├── config/                  # Environment, database & Supabase clients
│   │   ├── controllers/             # Request handlers (Auth, Job, Resume, Admin)
│   │   ├── middleware/              # Auth, RBAC, error handlers & validators
│   │   ├── routes/                  # Express API routers
│   │   ├── services/                # Core business logic & database operations
│   │   ├── utils/                   # JWT generation & verification
│   │   ├── validators/              # Payload input sanitizers
│   │   ├── app.js                   # Express application setup
│   │   └── server.js                # Server entry point
│   └── package.json
│
├── .env.example                     # Root environment template
├── .gitignore                       # Clean Git tracking configuration
├── render.yaml                      # Cloud deployment configuration
└── README.md                        # Master project documentation
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18.x or higher) & **npm**
- **Git**
- **Ollama**: [Download Ollama](https://ollama.com/) for local AI inference.
- **Supabase Account** (or a local PostgreSQL instance).

### 2. Clone Repository
```bash
git clone https://github.com/your-username/ElevAI.git
cd ElevAI
```

### 3. Setup Local AI (Ollama)
ElevAI utilizes the open-weight `qwen2.5:7b` model for local resume intelligence and mock interviewing:
```bash
# Pull the target model (approx. 4.7 GB)
ollama pull qwen2.5:7b

# Ensure Ollama is running (default port: 11434)
ollama serve
```

### 4. Setup Backend Server
```bash
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit server/.env with your Supabase DB URL and JWT Secret

# Generate Prisma Client & Sync Database
npm run prisma:generate
npm run prisma:push

# Start Backend Development Server
npm run dev
# Server will run at http://localhost:5000
```

### 5. Setup Frontend Client
```bash
# Open a new terminal window
cd client

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Ensure VITE_API_BASE_URL="http://localhost:5000/api"

# Start Frontend Development Server
npm run dev
# Client will run at http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend Configuration (`server/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Backend listening port | `5000` |
| `NODE_ENV` | Runtime environment | `development` or `production` |
| `DATABASE_URL` | Supabase / PostgreSQL pooled connection string | `postgresql://postgres:[PASSWORD]@[REF].supabase.co:5432/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase / PostgreSQL direct connection string | `postgresql://postgres:[PASSWORD]@[REF].supabase.co:5432/postgres` |
| `JWT_SECRET` | Secret key for signing authentication tokens | Strong 64-character random string |
| `JWT_EXPIRES_IN`| Token lifespan | `7d` |
| `OLLAMA_BASE_URL`| Local Ollama API host | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model identifier | `qwen2.5:7b` |
| `SUPABASE_URL` | Supabase Project URL | `https://[PROJECT_REF].supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key for private resume storage | `your_supabase_service_role_key` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |

### Frontend Configuration (`client/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint for Express API | `http://localhost:5000/api` |

---

## 📡 API Reference

### Authentication (`/api/auth`)
- `POST /register`: Register a new user with persona selection (`USER` for Candidate, `ADMIN` for Recruiter).
- `POST /login`: Authenticate credentials with optional role persona guard.
- `GET /me`: Retrieve the currently authenticated profile from JWT.

### Jobs & Requisitions (`/api/jobs`)
- `GET /`: Retrieve published jobs with search, category, and work-mode filters.
- `GET /:id`: Retrieve detailed job description, required skills, and deadlines.

### Resumes & AI Analysis (`/api/resumes` & `/api/analysis`)
- `POST /resumes/upload`: Upload PDF or DOCX file to Supabase Storage and parse raw text.
- `GET /resumes`: List all resumes uploaded by the authenticated candidate.
- `POST /analysis/analyze`: Trigger AI resume scoring against selected job description (ATS score, matched/missing skills).
- `GET /analysis/history`: View past resume analysis results.

### Job Applications (`/api/applications`)
- `POST /`: Submit application for a job with attached resume and computed match score snapshot.
- `GET /my`: List all applications submitted by the current candidate.
- `GET /:id`: View status and timeline of a specific application.

### Mock Interview Room (`/api/interview`)
- `POST /start`: Initiate a new mock interview session with specified role, type, and difficulty.
- `POST /:id/answer`: Submit answer to the active question and receive instant evaluation and score breakdown.
- `GET /history`: Review completed mock interview transcripts and scores.

### Recruiter & Admin Control (`/api/admin`)
- `GET /jobs`: List all managed jobs (including drafts and closed requisitions).
- `POST /jobs`: Create and publish a new job requisition.
- `PUT /jobs/:id`: Update job details or change status (`DRAFT`, `PUBLISHED`, `CLOSED`).
- `GET /applications`: Inspect submitted candidate dossiers across all jobs.
- `PATCH /applications/:id/status`: Update candidate hiring status (`SUBMITTED`, `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`).
- `POST /applications/:id/notes`: Add private recruiter evaluation notes.

---

## 🛡️ Security & Privacy

1. **Role-Based Access Control (RBAC)**: All administrative endpoints are guarded by `roleMiddleware(['ADMIN'])`. Candidates attempting to access recruiter controls receive immediate `403 Forbidden` responses.
2. **Local AI Privacy**: Resume texts and interview answers are processed locally on your machine via Ollama. No proprietary candidate data is sent to external commercial AI APIs.
3. **Password Security**: Passwords are encrypted using `bcryptjs` with salt rounds before database persistence.
4. **Secure Storage**: Uploaded resume files reside in private storage buckets accessible only via signed tokens or backend service role credentials.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for intelligent, transparent, and fair recruitment.</sub>
</div>
