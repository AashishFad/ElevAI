# ElevAI: An Autonomous Multimodal AI Platform for Multi-Dimensional Resume Optimization, Skill-Gap Diagnostics, and Real-Time Voice Interview Simulations

**Authors:** ElevAI Core Engineering & Research Team  
**Affiliation:** ElevAI Platform Research Group  
**Document Type:** Technical Research Paper & Backend Architecture Specification  
**Publication Date:** September 2026  
**Keywords:** Large Language Models, Generative AI, Multimodal Speech Recognition, ATS Resume Optimization, Semantic Alignment, Skill Taxonomy, Real-Time Speech Analytics.

---

## Abstract

The contemporary software engineering and technical hiring ecosystem is characterized by extreme informational asymmetry between candidate qualification profiles and dynamic job requirements. Conventional Application Tracking Systems (ATS) rely predominantly on rigid, syntactic keyword-matching heuristics that disproportionately penalize qualified non-traditional candidates while incentivizing unrepresentative keyword stuffing. Furthermore, candidates lack data-driven mechanisms to assess real-time role readiness, identify granular skill deficiencies, and rehearse technical communication in high-pressure interactive environments.

To resolve these systemic bottlenecks, we introduce **ElevAI**, an end-to-end, autonomous multimodal artificial intelligence platform architected to accelerate career readiness. ElevAI unifies:
1. An intelligent multi-format document parser and multi-dimensional ATS resume diagnostic engine;
2. An AST-inspired, action-driven resume bullet refactoring engine operating under strict factual safety bounds (XYZ/STAR formula);
3. A vectorized job-specific semantic alignment engine calculating requirement coverage and competitive positioning;
4. An automated skill-gap universe comparing candidate profiles against market-wide role taxonomies with adaptive learning roadmaps;
5. A low-latency multimodal voice and text mock interview simulator powered by the Web Speech API and Gemini 3.5 Flash, featuring real-time acoustic speech rate and filler-word diagnostics;
6. A modular, schema-enforced ATS resume builder with real-time generative writing assistance and print-ready PDF compilation;
7. An asynchronous event-driven notification dispatch pipeline.

This paper presents the formal mathematical foundations, system architecture, database schema integrity, fault-tolerant retry protocols, and complete end-to-end backend workflows governing the ElevAI platform.

---

## 1. Introduction & Motivation

Modern talent acquisition pipelines process millions of applicants annually. Despite advancements in natural language processing (NLP), mainstream ATS tools continue to exhibit substantial limitations:
- **Syntactic Brittleness:** Inability to semantically bridge synonymous technical competencies (e.g., recognizing that "Distributed Ledger Architecture" satisfies "Blockchain Protocol Design").
- **Lack of Actionable Feedback:** Candidates receive binary rejection signals devoid of diagnostic insight regarding rubric breakdowns (impact metrics, structural formatting, relevance).
- **Factual Hallucination in Automated Rewriting:** Generative tools frequently invent credentials, employers, or fabricated metrics, destroying candidate credibility.
- **Disconnection Between Resume & Verbal Fluency:** Writing an ATS-optimized resume does not prepare engineers for synchronous technical interviews, where acoustic pacing, articulation, and situational composure dictate hiring outcomes.

ElevAI addresses this multi-stage lifecycle through a unified, privacy-compliant, full-stack micro-architecture.

---

## 2. High-Level System Architecture

ElevAI is engineered around a reactive 4-tier decoupled architecture:

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|   React 18 + Vite SPA | Tailwind CSS Glassmorphic UI | Web Speech API   |
|   Lucide Icons | Recharts/Progress Rings | Context API Authentication   |
+------------------------------------+------------------------------------+
                                     |  HTTP REST / JSON / Multipart
                                     v
+------------------------------------+------------------------------------+
|                             API GATEWAY                                 |
|   Express.js 4.x | CORS | Multer In-Memory Storage | JWT Auth Guards    |
+------------------------------------+------------------------------------+
                                     |
      +------------------------------+-----------------------------+
      |                                                            |
      v                                                            v
+-----+-------------------------------+   +------------------------+-----+
|         APPLICATION SERVICES        |   |      PERSISTENCE LAYER       |
|  - auth.service.js                  |   |  PostgreSQL Database         |
|  - resume.service.js                |   |  Prisma ORM 6.x Client       |
|  - resumeImprovement.service.js     |   |  Relational Constraints      |
|  - jobOptimization.service.js       |   |  Cascading Deletes           |
|  - skillGap.service.js              |   +------------------------------+
|  - interview.service.js             |
|  - resumeBuilder.service.js         |
|  - notification.service.js          |
+---------------------+---------------+
                      |
                      v
+---------------------+---------------------------------------------------+
|                           AI INTELLIGENCE LAYER                         |
|   Google Gemini 3.5 Flash LLM | Structured JSON Schema Enforcement      |
|   Exponential Backoff Retry Engine | Deterministic Rule-Based Fallbacks |
+-------------------------------------------------------------------------+
```

---

## 3. Database Schema & Data Integrity Design

The persistence tier is powered by PostgreSQL via Prisma ORM. Key relational entities include:

### 3.1 Entity Relationship Overview
- **User (1:1) CareerGoal:** Calibrates all platform benchmarks against target role and experience level.
- **User (1:N) Resume:** Tracks raw document buffers, extraction status (`UPLOADING`, `PROCESSING`, `READY`, `FAILED`), and text chunks.
- **Resume (1:N) ResumeAnalysis:** Multi-dimensional score snapshots, rubric JSON arrays, and recommended competencies.
- **ResumeAnalysis (1:N) ResumeImprovement:** Side-by-side original versus improved bullet diffs.
- **User (1:N) JobOptimization:** Target JD semantic match reports, priority actions, and keyword vectors.
- **User (1:N) SkillGapAnalysis:** Role readiness metrics, missing competencies, and learning roadmaps.
- **User (1:N) InterviewSession (1:N) InterviewQuestion (1:1) InterviewAnswer:** Real-time interview transcripts, acoustic pacing metrics, and multi-criteria evaluation scores.
- **User (1:N) ResumeBuilderDocument:** Schema-validated customizable JSON resumes.
- **User (1:N) Notification & (1:1) NotificationPreference:** Configurable in-app event streams.

---

## 4. Module-by-Module Methodology & Backend Workflows

### 4.1 Career Goal Benchmark Calibration
Prior to running analyses, candidates establish a `CareerGoal` tuple $(R_{target}, L_{exp})$ where:
$$R_{target} \in \mathcal{R}_{predefined} \cup \mathcal{R}_{custom}, \quad L_{exp} \in \{\text{FRESHER}, \text{1-2 YRS}, \text{3-5 YRS}, \text{EXPERIENCED}\}$$

This state vector conditions all downstream Gemini prompt payloads, ensuring junior candidates are not evaluated against principal-level criteria.

---

### 4.2 Document Parsing & Multi-Dimensional ATS Resume Analyzer

#### Workflow Pipeline:
1. **Ingestion:** Candidate uploads `.pdf` or `.docx` document via `multipart/form-data`.
2. **Buffer Stream Parsing:** `pdf-parse` extracts raw text streams; `mammoth` extracts OpenXML word processing streams.
3. **LLM Structured Synthesis:** The extracted corpus $T_{resume}$ and $(R_{target}, L_{exp})$ are injected into Gemini 3.5 Flash under a strict JSON schema contract.
4. **Scoring Formulation:**
   $$\text{OverallScore} = \sum_{i=1}^{n} w_i \cdot S_i$$
   where $S_i \in [0, 100]$ represents scores across:
   - Impact Metrics & Quantifiable Evidence ($w_1 = 0.25$)
   - ATS Parsing & Keyword Density ($w_2 = 0.20$)
   - Structural Layout & Section Balance ($w_3 = 0.20$)
   - Role Relevance & Technical Depth ($w_4 = 0.20$)
   - Recruiter Readability & Action Verbs ($w_5 = 0.15$)

```
[Candidate PDF/DOCX]
        |
        v
[Multer Memory Stream]
        |
        +---> pdf-parse (PDF Stream Extractor)
        +---> mammoth (DOCX XML Extractor)
        |
        v
[Extracted Text Buffer Normalized]
        |
        v
[Gemini 3.5 Flash Engine + CareerGoal Context]
        |
        +---> Strict JSON Validation & Score Normalization
        +---> Database Persistence (ResumeAnalysis)
        +---> Asynchronous Notification Dispatch
        |
        v
[Client Visualization: Radial SVG Score Rings & Collapsible Feedbacks]
```

---

### 4.3 AST/NLP-Driven Resume Bullet Point Improver

#### Factual Safety Guarantee:
To eliminate AI hallucination, the engine enforces the **XYZ Formula**:
$$\text{"Accomplished [X], as measured by [Y], by doing [Z]"}$$
The system strictly prohibits inventing unmentioned employers, certifications, or fictitious numerical claims.

#### Workflow:
1. Extracted work experience and project descriptions are parsed into discrete bullet arrays $B = \{b_1, b_2, \dots, b_k\}$.
2. Each bullet $b_j$ is evaluated for:
   - Initial Weakness Classification (e.g., passive voice, missing metric, vague scope).
   - Action Verb Transmutation (e.g., "Worked on API" $\rightarrow$ "Architected high-throughput REST API").
   - Metric Scaffolding (prompting candidate with realistic metric placeholders).
3. The response returns paired diff blocks $\{b_j^{orig}, b_j^{improved}, \text{explanation}_j\}$.

---

### 4.4 Vectorized Job-Specific Resume Optimization

#### Workflow:
1. **Target JD Tokenization:** Candidate submits raw job description text $T_{JD}$ alongside target company metadata.
2. **Entity & Competency Extraction:** The system decomposes $T_{JD}$ into:
   - Mandatory Core Requirements $\mathcal{M}_{hard}$
   - Preferred Qualifications $\mathcal{P}_{qual}$
   - Domain Soft Skills $\mathcal{S}_{soft}$
3. **Set-Theoretic Alignment Formulation:**
   $$\text{MatchScore} = \alpha \cdot \frac{|\mathcal{C}_{resume} \cap \mathcal{M}_{hard}|}{|\mathcal{M}_{hard}|} + \beta \cdot \frac{|\mathcal{C}_{resume} \cap \mathcal{P}_{qual}|}{|\mathcal{P}_{qual}|} + \gamma \cdot \text{SemanticSimilarity}(T_{resume}, T_{JD})$$
   where $\alpha = 0.50, \beta = 0.30, \gamma = 0.20$.
4. **Actionable Output:** Missing keywords categorized by priority (Critical, High, Medium) with targeted section rewrite recommendations.

---

### 4.5 Skill Gap Universe & Adaptive Learning Roadmaps

#### Workflow:
1. Compares candidate verified skill clusters against target market expectations.
2. Segregates competencies into a tripartite taxonomy:
   - **Demonstrated Skills:** Verified in resume with clear contextual application.
   - **Partial / Transferable Skills:** Related foundational knowledge detected (e.g., Java knowledge applied to C# backend).
   - **Missing Priority Gaps:** Zero evidence found for core role competencies.
3. Generates structured, milestone-driven learning roadmaps with recommended project implementations and target verification milestones.

---

### 4.6 Multimodal Voice & AI Mock Interview Simulator

#### Speech & Voice Analytic Architecture:
- **Speech Capture & Transcription:** Client-side Web Speech API (`webkitSpeechRecognition`) streams acoustic buffers into real-time text tokens.
- **Voice Synthesis:** `SpeechSynthesisUtterance` vocalizes questions with natural pacing.
- **Acoustic Metric Extraction:**
  $$\text{Speaking Rate (WPM)} = \frac{\text{Word Count}}{\text{Duration (seconds)}} \times 60$$
  $$\text{Filler Ratio} = \frac{\sum \text{Filler Utterances ('um', 'uh', 'like', 'you know')}}{\text{Word Count}}$$

#### Live Session Workflow:
```
[Session Config: Role, Difficulty, Count, Voice/Text Mode]
                          |
                          v
[Gemini Generates Question Sequence Q_1 ... Q_n]
                          |
                          v
       +----------------->[Question Q_i Presented / Vocalized via TTS]
       |                  |
       |                  +---> Candidate Speaks (Web Speech Recognition)
       |                  +---> Live Transcript Displayed & Edited
       |                  |
       |                  v
       |           [Submit Answer Payload]
       |                  |
       |                  v
       |           [Local Acoustic Metrics Calculated (WPM, Fillers, Duration)]
       |                  |
       |                  v
       |           [Gemini 3.5 Rubric Evaluation Engine]
       |                  |
       |                  +---> Technical Score (0-10)
       |                  +---> Relevance Score (0-10)
       |                  +---> Communication Score (0-10)
       |                  +---> Strengths & Weaknesses JSON
       |                  +---> Educational Model Answer
       |                  |
       |                  v
       |           [Persist InterviewAnswer in PostgreSQL]
       |                  |
       +--(i < n)---------+
                          |
                      (i == n)
                          |
                          v
[Aggregate Session Scores: Overall, Technical, Relevance, Communication]
                          |
                          v
[Complete Interactive Performance Analytics Report & Voice Diagnostics]
```

---

### 4.7 ATS Resume Builder & Generative Writing Assistant
- Backed by an immutable JSON document structure supporting dynamic section reordering (`sectionOrder`), real-time typography styling, and standard single-column ATS layouts.
- Integrated AI writing modal for inline bullet enhancement, technical vocabulary amplification, and print-ready PDF generation.

---

### 4.8 Asynchronous Notification & Fault-Tolerant Retry Pipeline
- **Smart Notification Engine:** Dispatches categorized event records (`RESUME`, `JOB`, `SKILL_GAP`, `INTERVIEW`) governed by user-configured preferences.
- **Gemini Fault Tolerance:** Wraps all remote LLM calls in an exponential backoff loop with automatic fallback parsing to guarantee 100% service uptime during transient rate limits.

---

## 5. Summary of REST API Endpoint Specifications

| HTTP Method | Route | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | User registration & JWT generation | No |
| `POST` | `/api/auth/login` | User authentication | No |
| `GET` | `/api/auth/profile` | Retrieve active user profile | Yes |
| `PUT` | `/api/auth/profile` | Update user metadata | Yes |
| `GET` | `/api/career-goal` | Retrieve active career target | Yes |
| `POST` | `/api/career-goal` | Create / calibrate career target | Yes |
| `POST` | `/api/resumes/upload` | Ingest PDF/DOCX resume file | Yes |
| `GET` | `/api/resumes` | List user resumes | Yes |
| `POST` | `/api/resumes/:id/analyze` | Execute multi-dimensional ATS evaluation | Yes |
| `GET` | `/api/resumes/:id/analysis` | Fetch analysis result | Yes |
| `POST` | `/api/resumes/:id/improve` | Generate XYZ bullet improvements | Yes |
| `POST` | `/api/job-optimization/analyze` | Calculate job match optimization | Yes |
| `GET` | `/api/job-optimization/history` | List job match histories | Yes |
| `POST` | `/api/skill-gap/analyze` | Generate skill gap diagnostic report | Yes |
| `GET` | `/api/skill-gap/history` | List skill gap histories | Yes |
| `POST` | `/api/mock-interview/start` | Initialize mock interview session | Yes |
| `POST` | `/api/mock-interview/:id/answer` | Submit & evaluate answer | Yes |
| `GET` | `/api/mock-interview/:id` | Fetch session state & questions | Yes |
| `GET` | `/api/mock-interview/history` | List interview sessions | Yes |
| `GET` | `/api/resume-builder/docs` | List resume builder documents | Yes |
| `POST` | `/api/resume-builder/docs` | Create new builder document | Yes |
| `POST` | `/api/resume-builder/ai-improve` | Inline AI bullet point enhancer | Yes |
| `GET` | `/api/notifications` | Fetch unread / all notifications | Yes |
| `GET` | `/api/notifications/preferences` | Retrieve notification toggles | Yes |
| `PUT` | `/api/notifications/preferences` | Update notification toggles | Yes |

---

## 6. Conclusion & Future Roadmap

ElevAI demonstrates that combining fine-tuned LLM prompting with deterministic schema validation, local multimodal speech processing, and relational data structures delivers a transformative, highly reliable career preparation platform. Future extensions will incorporate video-based eye-contact analysis, automated GitHub repository code artifact scanning, and direct recruiter ATS webhooks.

---
*ElevAI Technical Research Group © 2026. All rights reserved.*
