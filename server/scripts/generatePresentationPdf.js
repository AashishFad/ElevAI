/**
 * ElevAI — PDF Slide Presentation Generator
 * Generates an 16:9 Landscape PDF version of the technical presentation deck.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generatePresentationPdf() {
  const pdfPath = path.join(__dirname, '../../ElevAI_Final_Project_Presentation.pdf');

  // A4 Landscape: 841.89 x 595.28 points (approx 16:9 widescreen feel)
  const doc = new PDFDocument({
    size: [842, 595],
    margins: { top: 35, bottom: 35, left: 45, right: 45 },
    info: {
      Title: 'ElevAI — Technical Project Presentation',
      Author: 'ElevAI Engineering Team',
      Subject: 'AI-Powered Smart Interview & Career Preparation Portal',
    },
  });

  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  const BG_COLOR = '#0B0F19';
  const CARD_BG = '#151E32';
  const CARD_BORDER = '#23324E';
  const TEXT_WHITE = '#F8FAFC';
  const TEXT_MUTED = '#94A3B8';
  const ACCENT_CYAN = '#06B6D4';
  const ACCENT_INDIGO = '#818CF8';
  const ACCENT_EMERALD = '#10B981';
  const ACCENT_AMBER = '#F59E0B';
  const ACCENT_PURPLE = '#C084FC';

  function drawSlideBase(title, subtitle) {
    // Background fill
    doc.rect(0, 0, 842, 595).fill(BG_COLOR);

    if (title) {
      doc.fontSize(20).font('Helvetica-Bold').fillColor(TEXT_WHITE);
      doc.text(title, 45, 35);

      if (subtitle) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(ACCENT_CYAN);
        doc.text(subtitle, 45, 62);
      }

      // Top divider line
      doc.strokeColor(CARD_BORDER).lineWidth(1).moveTo(45, 82).lineTo(797, 82).stroke();
    }

    // Footer
    doc.fontSize(8.5).font('Helvetica').fillColor('#475569');
    doc.text('ElevAI — AI-Powered Smart Interview & Career Preparation Portal', 45, 565);
    doc.text('Technical Architecture & Functional Overview', 545, 565, { width: 252, align: 'right' });
  }

  function drawCard({ x, y, w, h, title, titleColor = ACCENT_CYAN, body, borderColor = CARD_BORDER, fontSize = 9.5 }) {
    doc.roundedRect(x, y, w, h, 6).fillAndStroke(CARD_BG, borderColor);

    if (title) {
      doc.fontSize(11).font('Helvetica-Bold').fillColor(titleColor);
      doc.text(title, x + 14, y + 12, { width: w - 28 });
    }

    if (body) {
      doc.fontSize(fontSize).font('Helvetica').fillColor(TEXT_MUTED);
      doc.text(body, x + 14, y + (title ? 34 : 14), { width: w - 28, lineGap: 3.5 });
    }
  }

  // ==========================================
  // SLIDE 1: HERO TITLE SLIDE
  // ==========================================
  doc.rect(0, 0, 842, 595).fill(BG_COLOR);

  // Decorative Accent
  doc.roundedRect(65, 120, 190, 26, 4).fillAndStroke('#1E293B', ACCENT_CYAN);
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(ACCENT_CYAN);
  doc.text('FULL-STACK AI PLATFORM', 75, 128);

  doc.fontSize(44).font('Helvetica-Bold').fillColor(TEXT_WHITE);
  doc.text('ElevAI', 65, 160);

  doc.fontSize(18).font('Helvetica-Bold').fillColor(ACCENT_INDIGO);
  doc.text('AI-Powered Smart Interview & Career Preparation Portal', 65, 215);

  doc.fontSize(11).font('Helvetica').fillColor(TEXT_MUTED);
  doc.text(
    'An end-to-end career intelligence and recruitment portal bridging job seekers and hiring teams through multi-dimensional ATS resume intelligence, AI mock interviews, and automated recruitment pipelines.',
    65,
    250,
    { width: 700, lineGap: 4 }
  );

  const pillars = [
    { label: '⚛️ React 18 & Tailwind CSS', x: 65, color: ACCENT_CYAN },
    { label: '🚀 Node.js & Express REST API', x: 245, color: ACCENT_INDIGO },
    { label: '🐘 Supabase PostgreSQL & Prisma', x: 435, color: ACCENT_EMERALD },
    { label: '✨ Google Gemini 2.0 Generative AI', x: 635, color: ACCENT_PURPLE },
  ];

  pillars.forEach((p) => {
    doc.roundedRect(p.x, 340, 175, 45, 6).fillAndStroke(CARD_BG, p.color);
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(TEXT_WHITE);
    doc.text(p.label, p.x + 8, 355, { width: 159, align: 'center' });
  });

  doc.fontSize(14).font('Helvetica-Oblique').fillColor(ACCENT_CYAN);
  doc.text('"Your Career, Elevated."', 65, 450);

  // ==========================================
  // SLIDE 2: OVERVIEW
  // ==========================================
  doc.addPage();
  drawSlideBase('Project Overview & Core Mission', 'A Unified Platform for Candidates & Hiring Teams');

  const s2Cards = [
    { title: '📄 Resume Intelligence', body: 'Evaluates ATS compatibility (0–100 score), section structure, and rewires passive bullet points into quantifiable Google X-Y-Z achievements.', color: ACCENT_CYAN, x: 45, y: 95 },
    { title: '🎯 Job-Specific Fit', body: 'Computes mathematical match scores (0–100%) against live job descriptions, highlighting keyword density, matching skills, and critical gaps.', color: ACCENT_INDIGO, x: 300, y: 95 },
    { title: '🎙️ AI Mock Interview', body: 'Simulates dynamic Technical, HR, and Mixed interview sessions with automated feedback across technical depth, clarity, and ideal answers.', color: ACCENT_PURPLE, x: 555, y: 95 },
    { title: '🧭 Skill Gap Roadmaps', body: 'Extracts existing competencies and builds structured role readiness assessments with prioritized learning action items.', color: ACCENT_EMERALD, x: 45, y: 320 },
    { title: '📝 Interactive Builder', body: 'Drag-and-drop section customization, ATS preview, and direct single-click compilation into the active user resume vault.', color: ACCENT_AMBER, x: 300, y: 320 },
    { title: '🏢 Recruiter Control', body: 'Full job lifecycle management (Draft -> Publish -> Close), candidate review dossiers, private notes, and real PostgreSQL analytics.', color: ACCENT_CYAN, x: 555, y: 320 },
  ];

  s2Cards.forEach((c) => drawCard({ x: c.x, y: c.y, w: 242, h: 205, title: c.title, titleColor: c.color, body: c.body }));

  // ==========================================
  // SLIDE 3: PROBLEM STATEMENT
  // ==========================================
  doc.addPage();
  drawSlideBase('Problem Statement', 'Bridging the Critical Disconnect in Talent Acquisition');

  drawCard({
    x: 45,
    y: 95,
    w: 360,
    h: 435,
    title: '⚠️ Candidate / Student Challenges',
    titleColor: ACCENT_AMBER,
    body: '• Generic Static Resumes: Candidates submit identical resumes across diverse jobs, failing ATS keyword filters.\n\n• Ambiguous Skill Gaps: Job descriptions outline broad requirements; applicants do not know exact missing tools.\n\n• Cost-Prohibitive Mock Interviews: Personalized technical coaching is expensive and inaccessible to most students.\n\n• Disjointed Preparation: Switching between word processors, job boards, and tutorials causes fragmented career progress.',
    fontSize: 10.5,
  });

  drawCard({
    x: 435,
    y: 95,
    w: 360,
    h: 435,
    title: '🏢 Recruiter & Placement Pain Points',
    titleColor: ACCENT_CYAN,
    body: '• Manual Spreadsheet Filtering: Evaluating hundreds of unstructured resumes leads to severe review fatigue.\n\n• Opaque Candidate Match: Recruiters lack immediate skill match snapshots and quantitative compatibility metrics.\n\n• Disorganized Status Tracking: Candidate communications and stage updates get lost in fragmented email threads.\n\n• No Real-Time Telemetry: Lack of integrated recruitment analytics to track 30-day volume and talent shortages.',
    fontSize: 10.5,
  });

  // ==========================================
  // SLIDE 4: OBJECTIVES
  // ==========================================
  doc.addPage();
  drawSlideBase('Project Technical Objectives', 'Core Engineering Goals Accomplished in ElevAI');

  const s4Objs = [
    { title: '1. Multi-Format Ingestion', body: 'Parse PDF/DOCX resumes server-side up to 5MB, sanitize text buffers, and store securely in private cloud storage.', x: 45, y: 95 },
    { title: '2. AI ATS & Content Engine', body: 'Deploy Google Gemini 2.0 to generate multi-dimensional scoring (0–100) and Google X-Y-Z bullet rewrites.', x: 300, y: 95 },
    { title: '3. Job Compatibility Engine', body: 'Compute real-time role matching scores against live job postings with missing keyword identification.', x: 555, y: 95 },
    { title: '4. Interactive Mock Interview', body: 'Build dynamic Q&A interview engine evaluating technical depth, clarity, and reference responses in real time.', x: 45, y: 320 },
    { title: '5. Full Recruitment Pipeline', body: 'Deliver admin job lifecycle (Draft/Publish/Close), candidate review dossiers, and 6-stage status history audit.', x: 300, y: 320 },
    { title: '6. Zero-Downtime AI Resilience', body: 'Implement local heuristic fallback engines ensuring 100% platform availability during external AI quota spikes.', x: 555, y: 320 },
  ];

  s4Objs.forEach((o) => drawCard({ x: o.x, y: o.y, w: 242, h: 205, title: o.title, titleColor: ACCENT_INDIGO, body: o.body }));

  // ==========================================
  // SLIDE 5: SYSTEM ARCHITECTURE
  // ==========================================
  doc.addPage();
  drawSlideBase('System at a Glance', 'Decoupled Three-Tier Architecture & Data Flow');

  drawCard({
    x: 45,
    y: 95,
    w: 242,
    h: 435,
    title: '1. Presentation Tier',
    titleColor: ACCENT_CYAN,
    body: '⚛️ React 18 Single Page App\n\n🎨 Tailwind CSS UI (Dark Theme)\n\n🛣️ React Router DOM v7 (SPA)\n\n📊 Recharts Analytics Visuals\n\n🔐 Axios HTTP Client with JWT Request & Response Interceptors\n\n🛡️ Client Route Guards (ProtectedRoute & AdminRoute)',
    fontSize: 10,
  });

  drawCard({
    x: 300,
    y: 95,
    w: 242,
    h: 435,
    title: '2. Application & API Tier',
    titleColor: ACCENT_INDIGO,
    body: '🚀 Node.js & Express.js REST API\n\n🛡️ Middleware Pipeline (JWT Auth, requireAdmin RBAC, RFC 4122 UUID Validation)\n\n⚙️ Business Logic Services (Jobs, Resumes, Applications, Analytics)\n\n✨ Resilient Dual-Layer AI Engine (Gemini 2.0 + Heuristic Fallback)\n\n🔒 Error Sanitization & Security',
    fontSize: 10,
  });

  drawCard({
    x: 555,
    y: 95,
    w: 242,
    h: 435,
    title: '3. Data & Cloud Services',
    titleColor: ACCENT_EMERALD,
    body: '🐘 Supabase PostgreSQL (12 Relational Tables & Enums)\n\n⚡ Prisma ORM v6 Client & Type-Safe Query Engine\n\n🗄️ Supabase Storage (Private \'resumes\' Bucket & 1h Signed URLs)\n\n🤖 Google Gemini API (gemini-2.0-flash LLM Model)',
    fontSize: 10,
  });

  // ==========================================
  // SLIDE 6: TECHNOLOGY STACK
  // ==========================================
  doc.addPage();
  drawSlideBase('Technology Stack Matrix', 'Production-Grade Open Source & Cloud Technologies');

  const s6Stack = [
    { title: 'Frontend Layer', body: '• React.js 18 (SPA Architecture)\n• Tailwind CSS v4 (Glassmorphic Theme)\n• Vite 6 (High-Speed Bundler)\n• React Router DOM v7\n• Recharts (Telemetry Visuals)\n• Lucide React Icons', color: ACCENT_CYAN, x: 45, y: 95 },
    { title: 'Backend & Server', body: '• Node.js v20+ / v25 Runtime\n• Express.js v4.21 REST Server\n• Prisma ORM v6 Data Modeling\n• Multer (Multipart Memory Uploads)\n• PDF-Parse & Mammoth (Extraction)\n• Bcrypt.js & JWT Security', color: ACCENT_INDIGO, x: 300, y: 95 },
    { title: 'Database & Storage', body: '• Supabase PostgreSQL 15+\n• 12 Relational Tables & Cascades\n• Relational Enums & Unique Keys\n• Supabase Cloud Object Storage\n• Time-Limited Signed Downloads\n• Transaction & Session Pooling', color: ACCENT_EMERALD, x: 555, y: 95 },
    { title: 'AI & Intelligence', body: '• Google Gemini API (@google/genai)\n• LLM Model: gemini-2.0-flash\n• Structured JSON Prompt Contracts\n• Local Heuristic Offline Engine\n• Zero-Downtime Rate Handling\n• Parameterized Prompt Security', color: ACCENT_PURPLE, x: 45, y: 320 },
    { title: 'Security & Auth', body: '• Stateless Signed JWT (7-day)\n• 10-Round Salted Bcrypt Hashing\n• Server-Side requireAdmin RBAC\n• RFC 4122 UUID Parameter Guards\n• IDOR Compound Scoping Filters\n• Strict Production CORS Limits', color: ACCENT_AMBER, x: 300, y: 320 },
    { title: 'Deployment & CI/CD', body: '• Render Web Service (Backend)\n• Render Static Site (Frontend)\n• SPA Redirect Rewrite (/* /index.html)\n• Render YAML Blueprint Config\n• Parameterized .env Isolation\n• Zero Secrets in Client Bundles', color: ACCENT_CYAN, x: 555, y: 320 },
  ];

  s6Stack.forEach((s) => drawCard({ x: s.x, y: s.y, w: 242, h: 205, title: s.title, titleColor: s.color, body: s.body, fontSize: 9.5 }));

  // ==========================================
  // SLIDE 7: USER WORKFLOW
  // ==========================================
  doc.addPage();
  drawSlideBase('Candidate End-to-End Workflow', 'Seamless Progression from Onboarding to Application');

  const s7Steps = [
    { title: 'Step 1: Register', body: 'Create account with bcrypt security; establish target Career Goal & experience level.', x: 45, y: 95 },
    { title: 'Step 2: Upload / Build', body: 'Upload PDF/DOCX or use Interactive Builder; text is parsed and stored in private vault.', x: 235, y: 95 },
    { title: 'Step 3: ATS Analysis', body: 'Receive instant 0–100 ATS Score, section ratings, skill categorization & weaknesses.', x: 425, y: 95 },
    { title: 'Step 4: X-Y-Z Rewrite', body: 'Review bullet rewrites formatted with quantifiable impact metrics while preserving facts.', x: 615, y: 95 },
    { title: 'Step 5: Skill Gap', body: 'Identify critical missing technologies and follow prioritized learning roadmaps.', x: 45, y: 320 },
    { title: 'Step 6: Mock Interview', body: 'Practice role-specific Q&A rounds with instant grading on depth and clarity.', x: 235, y: 320 },
    { title: 'Step 7: Job Fit', body: 'Analyze resume against target job description to get match score & missing keywords.', x: 425, y: 320 },
    { title: 'Step 8: Apply & Track', body: 'Submit application with score snapshot; track live status (SUBMITTED -> SELECTED).', x: 615, y: 320 },
  ];

  s7Steps.forEach((st) => drawCard({ x: st.x, y: st.y, w: 175, h: 205, title: st.title, titleColor: ACCENT_CYAN, body: st.body, fontSize: 9.5 }));

  // ==========================================
  // SLIDE 8: AI PROCESSING & FALLBACK
  // ==========================================
  doc.addPage();
  drawSlideBase('AI Processing Pipeline & Fault Tolerance', 'Dual-Layer Architecture Guaranteeing 100% Availability');

  drawCard({
    x: 45,
    y: 95,
    w: 360,
    h: 435,
    title: '🤖 Primary AI Pipeline (Gemini 2.0)',
    titleColor: ACCENT_PURPLE,
    body: '1. User Request: Client submits resume/job payload.\n\n2. Server-Side Context Injection: Express backend combines candidate Career Goal, target role, and extracted text.\n\n3. Structured Prompt Engineering: Strictly enforces JSON response contracts with predefined schema schemas.\n\n4. Gemini 2.0 API Execution: Dispatches request to gemini-2.0-flash model.\n\n5. JSON Schema Validation: Validates score bounds (0–100), section arrays, and action items before DB persistence.',
    fontSize: 10.5,
  });

  drawCard({
    x: 435,
    y: 95,
    w: 360,
    h: 435,
    title: '🛡️ Resilient Offline Heuristic Fallback',
    titleColor: ACCENT_EMERALD,
    body: '• The Problem: Upstream free-tier Google Gemini API accounts enforce rate limits (20 requests/day).\n\n• ElevAI Solution: When HTTP 429 or 503 is intercepted, the service automatically diverts to local heuristic calculation engines.\n\n• How It Works: Scans text for 60+ technical competencies, computes keyword density, and generates structured feedback.\n\n• Zero User Impact: Candidates receive complete, actionable reports without application crashes or 500 errors.',
    fontSize: 10.5,
  });

  // ==========================================
  // SLIDE 9: RESUME SYSTEM
  // ==========================================
  doc.addPage();
  drawSlideBase('Resume Intelligence & Vault Lifecycle', 'Multi-Format Processing, Versioning & Deletion Safety');

  const s9Cards = [
    { title: '1. Upload Ingestion', body: 'Supports PDF, DOCX, DOC, and TXT files up to 5MB. Multer handles in-memory file buffers securely.', color: ACCENT_CYAN, x: 45 },
    { title: '2. Text Extraction', body: 'pdf-parse and mammoth extract clean text strings, stripping binary metadata and formatting artifacts.', color: ACCENT_INDIGO, x: 235 },
    { title: '3. Cloud Storage Vault', body: 'Files saved under user-scoped paths in private Supabase Storage. Downloads require 1-hour signed URLs.', color: ACCENT_EMERALD, x: 425 },
    { title: '4. Deletion Safety', body: 'Resumes attached to active submitted applications are locked to preserve audit integrity for recruiters.', color: ACCENT_AMBER, x: 615 },
  ];

  s9Cards.forEach((c) => drawCard({ x: c.x, y: 95, w: 175, h: 205, title: c.title, titleColor: c.color, body: c.body, fontSize: 9.5 }));

  drawCard({
    x: 45,
    y: 320,
    w: 750,
    h: 210,
    title: '📝 Interactive Resume Builder & Direct Vault Export',
    titleColor: ACCENT_PURPLE,
    body: '• Multi-Section Editing: Personal Info, Professional Summary, Categorized Skills, Work Experience, Education, Projects, and Custom Sections.\n• Live ATS Preview: Instant visual formatting ensuring clean typography and structural readability.\n• Direct Vault Export: Compiles builder documents directly into a READY resume in the user\'s vault for one-click job applications.',
    fontSize: 10.5,
  });

  // ==========================================
  // SLIDE 10: JOB MARKETPLACE
  // ==========================================
  doc.addPage();
  drawSlideBase('Job Marketplace & Application Workflow', 'Integrated Requisition, Optimization & Submission Flow');

  const s10Flow = [
    { title: '1. Admin Posts Job', body: 'Requisition created with title, required skills, preferred tech, salary band, and deadline.', x: 45 },
    { title: '2. Targeted Alert', body: 'System notifies candidates whose career goals align with the new job opening.', x: 235 },
    { title: '3. Fit Analysis', body: 'Candidate analyzes resume against job description, getting match score & missing keywords.', x: 425 },
    { title: '4. One-Click Apply', body: 'Application submitted with permanent snapshot of resume and match score (duplicate 409 protected).', x: 615 },
  ];

  s10Flow.forEach((f) => drawCard({ x: f.x, y: 95, w: 175, h: 205, title: f.title, titleColor: ACCENT_CYAN, body: f.body, fontSize: 9.5 }));

  drawCard({
    x: 45,
    y: 320,
    w: 750,
    h: 210,
    title: '🛡️ Candidate Experience & Application Protection Rules',
    titleColor: ACCENT_EMERALD,
    body: '• No Automatic Rejection: Candidates with lower match scores are never auto-rejected; recruiters review all applicants.\n• Deadline Enforcement: Submissions to expired or CLOSED requisitions are automatically rejected by backend validators.\n• Immutable Snapshot: If a candidate later edits their resume, the recruiter still sees the exact version submitted.',
    fontSize: 10.5,
  });

  // ==========================================
  // SLIDE 11: ADMIN CONTROL PANEL
  // ==========================================
  doc.addPage();
  drawSlideBase('Admin Recruitment Control Suite', 'Centralized Candidate Review, Dossiers & Management');

  const s11Admin = [
    { title: '📈 Overview Telemetry', body: 'Real-time counters for total users, published jobs, draft requisitions, pending reviews, and selected offers.', color: ACCENT_CYAN, x: 45, y: 95 },
    { title: '📝 Job Requisitions', body: 'Full CRUD suite: create draft jobs, publish requisitions, set salary ranges, and close expired listings.', color: ACCENT_INDIGO, x: 300, y: 95 },
    { title: '👥 Review Dossier', body: 'Inspect candidate profile, submitted cover letter, AI match score snapshot, and generate secure resume links.', color: ACCENT_PURPLE, x: 555, y: 95 },
    { title: '🔒 Private Notes', body: 'Record internal evaluation remarks attached to candidate applications (strictly hidden from user API).', color: ACCENT_AMBER, x: 45, y: 320 },
    { title: '🔄 Pipeline Manager', body: 'Transition candidates through recruitment stages (SUBMITTED -> SELECTED) with automated audit logging.', color: ACCENT_EMERALD, x: 300, y: 320 },
    { title: '📊 Analytics Engine', body: 'Live PostgreSQL engine: 30-day continuous application trends, skill demand ranking, and deadline radars.', color: ACCENT_CYAN, x: 555, y: 320 },
  ];

  s11Admin.forEach((a) => drawCard({ x: a.x, y: a.y, w: 242, h: 205, title: a.title, titleColor: a.color, body: a.body }));

  // ==========================================
  // SLIDE 12: STATUS PIPELINE
  // ==========================================
  doc.addPage();
  drawSlideBase('Application Status Lifecycle & Audit Trail', '6-Stage Candidate Progression with Immutable History');

  const s12Stages = [
    { name: 'SUBMITTED', desc: 'Application received with resume snapshot.', color: ACCENT_CYAN, x: 45 },
    { name: 'UNDER_REVIEW', desc: 'Recruiter opens candidate dossier.', color: ACCENT_INDIGO, x: 172 },
    { name: 'SHORTLISTED', desc: 'Candidate meets key technical criteria.', color: ACCENT_PURPLE, x: 299 },
    { name: 'INTERVIEW', desc: 'Candidate scheduled for technical round.', color: ACCENT_AMBER, x: 426 },
    { name: 'SELECTED', desc: 'Offer extended to successful candidate.', color: ACCENT_EMERALD, x: 553 },
    { name: 'REJECTED', desc: 'Application archived with decision notice.', color: '#EF4444', x: 680 },
  ];

  s12Stages.forEach((s) => drawCard({ x: s.x, y: 95, w: 118, h: 205, title: s.name, titleColor: s.color, body: s.desc, fontSize: 8.5 }));

  drawCard({
    x: 45,
    y: 320,
    w: 750,
    h: 210,
    title: '📋 Immutable Status History Audit Log (`ApplicationStatusHistory`)',
    titleColor: ACCENT_EMERALD,
    body: '• Full Traceability: Every status change creates an immutable event recording oldStatus, newStatus, changedById, and timestamp.\n• Candidate Notification Dispatch: Status changes trigger instant notification alerts routed to the applicant\'s dashboard.\n• Multi-Tenant Isolation: Candidates can only view public status transitions; internal recruiter notes are strictly withheld.',
    fontSize: 10.5,
  });

  // ==========================================
  // SLIDE 13: DATABASE ER DIAGRAM
  // ==========================================
  doc.addPage();
  drawSlideBase('Database Entity-Relationship Architecture', '12 Relational PostgreSQL Tables Modeled with Prisma ORM');

  const s13Entities = [
    { name: 'User', body: '• id (UUID, PK)\n• email (Unique)\n• passwordHash\n• role (USER/ADMIN)', color: ACCENT_CYAN, x: 45, y: 95 },
    { name: 'CareerGoal', body: '• id (UUID, PK)\n• userId (FK, Unique)\n• targetRole\n• experienceLevel', color: ACCENT_INDIGO, x: 235, y: 95 },
    { name: 'Resume', body: '• id (UUID, PK)\n• userId (FK)\n• storagePath\n• extractedText\n• status (READY)', color: ACCENT_EMERALD, x: 425, y: 95 },
    { name: 'Job', body: '• id (UUID, PK)\n• createdBy (FK)\n• title, description\n• requiredSkills\n• status (PUBLISHED)', color: ACCENT_PURPLE, x: 615, y: 95 },
    { name: 'Application', body: '• id (UUID, PK)\n• jobId (FK)\n• userId (FK)\n• resumeId (FK)\n• matchScore, status', color: ACCENT_AMBER, x: 45, y: 320 },
    { name: 'StatusHistory', body: '• id (UUID, PK)\n• applicationId (FK)\n• oldStatus, newStatus\n• changedById (FK)', color: ACCENT_CYAN, x: 235, y: 320 },
    { name: 'ApplicationNote', body: '• id (UUID, PK)\n• applicationId (FK)\n• adminId (FK)\n• note (Text)', color: ACCENT_INDIGO, x: 425, y: 320 },
    { name: 'AI Records', body: '• ResumeAnalysis\n• ResumeImprovement\n• JobOptimization\n• SkillGapAnalysis', color: ACCENT_EMERALD, x: 615, y: 320 },
  ];

  s13Entities.forEach((e) => drawCard({ x: e.x, y: e.y, w: 175, h: 205, title: e.name, titleColor: e.color, body: e.body, fontSize: 9 }));

  // ==========================================
  // SLIDE 14: BACKEND REQUEST FLOW
  // ==========================================
  doc.addPage();
  drawSlideBase('Backend Request & API Execution Lifecycle', 'Layered Defense, Validation & Processing Pipeline');

  const s14Steps = [
    { title: '1. Inbound', body: 'Browser dispatches HTTPS request with Bearer JWT header.', x: 45 },
    { title: '2. Headers', body: 'Express applies X-Frame-Options: DENY, nosniff, and CORS.', x: 172 },
    { title: '3. Auth Mid', body: 'Verifies cryptographically signed JWT; attaches req.user.', x: 299 },
    { title: '4. UUID Check', body: 'validateUUIDParams checks RFC 4122 regex; rejects SQLi.', x: 426 },
    { title: '5. Services', body: 'Executes Prisma queries or Gemini AI processing.', x: 553 },
    { title: '6. JSON Out', body: 'Returns formatted response; masks database errors.', x: 680 },
  ];

  s14Steps.forEach((s) => drawCard({ x: s.x, y: 95, w: 118, h: 205, title: s.title, titleColor: ACCENT_CYAN, body: s.body, fontSize: 8.5 }));

  drawCard({
    x: 45,
    y: 320,
    w: 750,
    h: 210,
    title: '🛡️ Real-World Trace: Candidate Submits Job Application (`POST /api/applications`)',
    titleColor: ACCENT_INDIGO,
    body: '1. JWT Authenticated -> 2. Verify jobId & resumeId UUIDs -> 3. Ensure Job is PUBLISHED & deadline active -> 4. Confirm Resume ownership -> 5. Check duplicate application (409 if exists) -> 6. Store Application with matchScore -> 7. Append SUBMITTED to status history -> 8. Return HTTP 201 Created.',
    fontSize: 10.5,
  });

  // ==========================================
  // SLIDE 15: SECURITY & RBAC
  // ==========================================
  doc.addPage();
  drawSlideBase('Multi-Layered Security & RBAC Enforcement', 'Comprehensive Protections Shielding Application Data');

  const s15Sec = [
    { title: '🔑 Password Security', body: '10-round salted bcrypt hashing ensures raw passwords are never stored.', color: ACCENT_CYAN, x: 45, y: 95 },
    { title: '🛡️ Server-Side RBAC', body: 'requireAdmin middleware validates JWT role, blocking unauthorized candidates.', color: ACCENT_INDIGO, x: 300, y: 95 },
    { title: '🚫 IDOR Elimination', body: 'Every database query filters by authenticated userId, preventing cross-tenant access.', color: ACCENT_EMERALD, x: 555, y: 95 },
    { title: '🛡️ Parameter Hardening', body: 'RFC 4122 regex validation on all route IDs blocks SQL injection & path traversal.', color: ACCENT_AMBER, x: 45, y: 320 },
    { title: '🗄️ Private Storage', body: 'Supabase Storage bucket is private; downloads require 1-hour signed URLs.', color: ACCENT_PURPLE, x: 300, y: 320 },
    { title: '🔒 Zero Client Secrets', body: 'Backend API keys (Gemini, Supabase Service Role) are never exposed to browser.', color: ACCENT_CYAN, x: 555, y: 320 },
  ];

  s15Sec.forEach((s) => drawCard({ x: s.x, y: s.y, w: 242, h: 205, title: s.title, titleColor: s.color, body: s.body }));

  // ==========================================
  // SLIDE 16: NOTIFICATIONS & ANALYTICS
  // ==========================================
  doc.addPage();
  drawSlideBase('Smart Notifications & Real Analytics Engine', 'Live Database Telemetry Without Synthetic Numbers');

  drawCard({
    x: 45,
    y: 95,
    w: 360,
    h: 435,
    title: '🔔 Smart Notification System',
    titleColor: ACCENT_CYAN,
    body: '• Event-Driven Routing: Instant alerts dispatched when matching jobs are published or application statuses update.\n\n• Live Bell Badge Counter: Unread indicator automatically updates and decrements upon mark-as-read.\n\n• Multi-Tenant Isolation: User B is strictly blocked from reading, modifying, or deleting User A notifications.\n\n• User Preference Controls: Candidates can toggle notification categories (Jobs, Resumes, Reminders).',
    fontSize: 10.5,
  });

  drawCard({
    x: 435,
    y: 95,
    w: 360,
    h: 435,
    title: '📊 Recruitment Analytics Engine',
    titleColor: ACCENT_INDIGO,
    body: '• 100% Real Database Data: All metrics calculated from live PostgreSQL records without hardcoded numbers.\n\n• 30-Day Continuous Trends: Daily time-series buckets ensure empty days reflect 0 submissions rather than gaps.\n\n• Recruitment Funnel: Real progression rates from SUBMITTED -> UNDER_REVIEW -> SHORTLISTED -> SELECTED.\n\n• Skill Demand Radar: Aggregates top required skills across all active postings to identify talent trends.',
    fontSize: 10.5,
  });

  // ==========================================
  // SLIDE 17: UI/UX DESIGN
  // ==========================================
  doc.addPage();
  drawSlideBase('UI/UX Design & Product Experience', 'Cyber Glassmorphism with Fluid Responsiveness');

  const s17Ui = [
    { title: '🌌 Glassmorphism', body: 'Dark slate palette (#0A0E17) with translucent cards, 1px subtle borders, and soft backdrop blurs.', color: ACCENT_CYAN, x: 45, y: 95 },
    { title: '📱 Fully Responsive', body: 'Adaptive layouts across mobile (320px), tablet, laptop, and ultra-wide 4K desktop screens.', color: ACCENT_INDIGO, x: 300, y: 95 },
    { title: '⚡ Micro-Animations', body: 'Smooth Recharts visual progressions, hover glow transitions, and responsive modal dialogues.', color: ACCENT_EMERALD, x: 555, y: 95 },
    { title: '🔔 Contextual Toasts', body: 'Interactive feedback system with success, error, warning, and loading status states.', color: ACCENT_AMBER, x: 45, y: 320 },
    { title: '🎛️ Tabbed Views', body: 'Clean separation between Candidate tools, Resume vaults, Job feeds, and Admin control suites.', color: ACCENT_PURPLE, x: 300, y: 320 },
    { title: '♿ Accessible Controls', body: 'Semantic HTML5 structure, ARIA accessibility attributes, and high-contrast readable typography.', color: ACCENT_CYAN, x: 555, y: 320 },
  ];

  s17Ui.forEach((u) => drawCard({ x: u.x, y: u.y, w: 242, h: 205, title: u.title, titleColor: u.color, body: u.body }));

  // ==========================================
  // SLIDE 18: TESTING & VERIFICATION
  // ==========================================
  doc.addPage();
  drawSlideBase('Testing & Master Verification Status', '100% Pass Rate Across Automated Full-Lifecycle Audits');

  const s18Tests = [
    { name: 'Auth & Credentials', status: 'PASS (8/8)', x: 45, y: 95 },
    { name: 'Admin RBAC Checks', status: 'PASS (3/3)', x: 235, y: 95 },
    { name: 'Resume Vault & Locks', status: 'PASS (7/7)', x: 425, y: 95 },
    { name: 'AI Fallback Resilience', status: 'PASS (4/4)', x: 615, y: 95 },
    { name: 'Job Lifecycle Rules', status: 'PASS (6/6)', x: 45, y: 240 },
    { name: 'Application Tracking', status: 'PASS (6/6)', x: 235, y: 240 },
    { name: 'Admin Review Dossier', status: 'PASS (9/9)', x: 425, y: 240 },
    { name: 'Analytics Calculations', status: 'PASS (5/5)', x: 615, y: 240 },
    { name: 'Parameter Hardening', status: 'PASS (5/5)', x: 45, y: 385 },
    { name: 'Client Vite Build', status: 'PASS (14s)', x: 235, y: 385 },
    { name: 'API Health Endpoints', status: 'PASS (200)', x: 425, y: 385 },
    { name: 'OVERALL VERIFICATION', status: '54/54 PASS', x: 615, y: 385 },
  ];

  s18Tests.forEach((t) => {
    drawCard({
      x: t.x,
      y: t.y,
      w: 175,
      h: 125,
      title: t.name,
      titleColor: TEXT_WHITE,
      body: `Result: ${t.status}`,
      borderColor: ACCENT_EMERALD,
      fontSize: 10,
    });
  });

  // ==========================================
  // SLIDE 19: LIMITATIONS & FUTURE SCOPE
  // ==========================================
  doc.addPage();
  drawSlideBase('Current Limitations & Future Roadmap', 'Operational Realities & Strategic Product Roadmap');

  drawCard({
    x: 45,
    y: 95,
    w: 360,
    h: 435,
    title: '⚠️ Current System Limitations',
    titleColor: ACCENT_AMBER,
    body: '1. Upstream AI Rate Quotas: Google Gemini free-tier accounts enforce a 20 request/day quota. (Mitigated by ElevAI\'s built-in offline heuristic fallback engine).\n\n2. Browser Web Speech Dependency: Voice input during mock interviews depends on browser Web Speech API support (Chrome/Edge recommended).\n\n3. Single Requisition Attachments: Applications currently link one primary resume version per job submission.',
    fontSize: 10.5,
  });

  drawCard({
    x: 435,
    y: 95,
    w: 360,
    h: 435,
    title: '🚀 Future Scope & Strategic Roadmap',
    titleColor: ACCENT_CYAN,
    body: '• Out-of-Band Email Alerts: Integration with SendGrid / AWS SES for automated email notifications on status updates.\n\n• Embedded WebRTC Video Interviews: Direct browser-to-browser video conferencing within the Admin Review Suite.\n\n• Bulk Recruiter Resume Parsing: Multi-resume batch uploads and automated talent matching for high-volume hiring.\n\n• Native Mobile Apps: Cross-platform React Native applications for iOS and Android devices.',
    fontSize: 10.5,
  });

  // ==========================================
  // SLIDE 20: CONCLUSION
  // ==========================================
  doc.addPage();
  doc.rect(0, 0, 842, 595).fill(BG_COLOR);

  doc.fontSize(32).font('Helvetica-Bold').fillColor(TEXT_WHITE);
  doc.text('ElevAI — Final Summary', 65, 80);

  doc.fontSize(15).font('Helvetica-Bold').fillColor(ACCENT_CYAN);
  doc.text('A Production-Ready Career Intelligence & Recruitment Platform', 65, 125);

  drawCard({
    x: 65,
    y: 170,
    w: 712,
    h: 270,
    title: '🎯 Key Engineering Achievements',
    titleColor: ACCENT_EMERALD,
    body: '✔ Complete Candidate Career Suite: Multi-format ATS analysis, X-Y-Z content rewrites, job fit optimization, and interactive mock interviews.\n\n✔ Full Recruiter Control: Job requisition management, candidate review dossiers, private recruiter notes, and real PostgreSQL analytics.\n\n✔ Robust Decoupled Architecture: React 18 SPA + Node/Express REST API + Supabase PostgreSQL + Google Gemini 2.0 AI.\n\n✔ Zero-Downtime Resilience: Built-in heuristic fallback engine ensuring 100% platform availability during AI quota spikes.\n\n✔ Multi-Layered Security: Strict server-side RBAC, IDOR compound filters, parameter hardening, and private cloud storage signed URLs.',
    fontSize: 11,
  });

  doc.fontSize(18).font('Helvetica-Bold').fillColor(ACCENT_INDIGO);
  doc.text('ElevAI — "Your Career, Elevated."', 65, 485, { width: 712, align: 'center' });

  doc.end();

  writeStream.on('finish', () => {
    console.log(`[Success] Presentation PDF created successfully at:\n${pdfPath}`);
  });
}

generatePresentationPdf();
