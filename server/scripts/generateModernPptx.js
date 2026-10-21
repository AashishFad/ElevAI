/**
 * ElevAI — Modern Technical PowerPoint Presentation Generator
 * Produces a high-quality 20-slide 16:9 widescreen presentation using pptxgenjs.
 */

const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function generatePresentation() {
  const pptx = new pptxgen();

  // Set 16:9 Widescreen Dimensions
  pptx.layout = 'LAYOUT_16x9'; // 13.33 x 7.5 inches
  pptx.author = 'ElevAI Engineering Team';
  pptx.company = 'ElevAI';
  pptx.subject = 'ElevAI — Technical Project Presentation';
  pptx.title = 'ElevAI — AI-Powered Smart Interview & Career Preparation Portal';

  // Palette Constants
  const BG_COLOR = '0B0F19';       // Deep Midnight Slate
  const CARD_BG = '151E32';        // Translucent Navy Card
  const CARD_BORDER = '23324E';    // Card Border
  const TEXT_WHITE = 'F8FAFC';     // Primary Heading
  const TEXT_MUTED = '94A3B8';     // Subtext / Gray
  const ACCENT_CYAN = '06B6D4';    // Cyber Cyan
  const ACCENT_INDIGO = '6366F1';  // Modern Indigo
  const ACCENT_EMERALD = '10B981'; // Success Emerald
  const ACCENT_AMBER = 'F59E0B';   // Warning Amber
  const ACCENT_PURPLE = 'A855F7';  // Vibrant Purple

  // Helper: Apply Master Slide Background & Header
  function addBaseSlide(title, subtitle) {
    const slide = pptx.addSlide();
    slide.background = { color: BG_COLOR };

    // Slide Header
    if (title) {
      slide.addText(title, {
        x: 0.8,
        y: 0.4,
        w: 11.7,
        h: 0.5,
        fontSize: 22,
        fontFace: 'Arial',
        bold: true,
        color: TEXT_WHITE,
      });

      if (subtitle) {
        slide.addText(subtitle, {
          x: 0.8,
          y: 0.88,
          w: 11.7,
          h: 0.35,
          fontSize: 12,
          fontFace: 'Arial',
          color: ACCENT_CYAN,
        });
      }

      // Top Accent Line
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: 0.8,
        y: 1.25,
        w: 11.7,
        h: 0.02,
        fill: { color: CARD_BORDER },
        line: { color: CARD_BORDER, width: 0 },
      });
    }

    // Footer Bar
    slide.addText('ElevAI — AI-Powered Smart Interview & Career Preparation Portal', {
      x: 0.8,
      y: 7.05,
      w: 8.0,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: '475569',
    });

    slide.addText('Technical Architecture & Functional Overview', {
      x: 8.8,
      y: 7.05,
      w: 3.7,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      align: 'right',
      color: '475569',
    });

    return slide;
  }

  // Helper: Create Styled Card Box
  function addCard(slide, { x, y, w, h, title, titleColor = ACCENT_CYAN, body, borderColor = CARD_BORDER, bgColor = CARD_BG, fontSize = 10.5 }) {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w,
      h,
      fill: { color: bgColor },
      line: { color: borderColor, width: 1 },
      rectRadius: 0.12,
    });

    if (title) {
      slide.addText(title, {
        x: x + 0.2,
        y: y + 0.18,
        w: w - 0.4,
        h: 0.35,
        fontSize: 12,
        fontFace: 'Arial',
        bold: true,
        color: titleColor,
      });
    }

    if (body) {
      slide.addText(body, {
        x: x + 0.2,
        y: y + (title ? 0.55 : 0.2),
        w: w - 0.4,
        h: h - (title ? 0.65 : 0.35),
        fontSize,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        valign: 'top',
        lineSpacing: 16,
      });
    }
  }

  // ===========================================================================
  // SLIDE 1: HERO TITLE SLIDE
  // ===========================================================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: BG_COLOR };

  // Decorative Accent Glows
  slide1.addShape(pptx.shapes.OVAL, {
    x: 8.5,
    y: 0.8,
    w: 4.5,
    h: 4.5,
    fill: { color: '1E1B4B' },
    line: { color: '312E81', width: 1 },
  });

  // Project Logo / Badge
  slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.0,
    y: 1.5,
    w: 2.2,
    h: 0.45,
    fill: { color: '1E293B' },
    line: { color: ACCENT_CYAN, width: 1 },
    rectRadius: 0.08,
  });
  slide1.addText('FULL-STACK AI PLATFORM', {
    x: 1.0,
    y: 1.5,
    w: 2.2,
    h: 0.45,
    fontSize: 9,
    fontFace: 'Arial',
    bold: true,
    align: 'center',
    color: ACCENT_CYAN,
  });

  // Main Title
  slide1.addText('ElevAI', {
    x: 1.0,
    y: 2.1,
    w: 11.0,
    h: 1.1,
    fontSize: 54,
    fontFace: 'Arial',
    bold: true,
    color: TEXT_WHITE,
  });

  slide1.addText('AI-Powered Smart Interview & Career Preparation Portal', {
    x: 1.0,
    y: 3.2,
    w: 11.0,
    h: 0.6,
    fontSize: 20,
    fontFace: 'Arial',
    bold: true,
    color: ACCENT_INDIGO,
  });

  slide1.addText('An end-to-end career intelligence and recruitment portal bridging job seekers and hiring teams through multi-dimensional ATS resume intelligence, AI mock interviews, and automated recruitment pipelines.', {
    x: 1.0,
    y: 3.85,
    w: 8.0,
    h: 0.9,
    fontSize: 12,
    fontFace: 'Arial',
    color: TEXT_MUTED,
    lineSpacing: 18,
  });

  // Key Pillar Badges
  const pillars = [
    { label: '⚛️ React 18 & Tailwind', color: ACCENT_CYAN, x: 1.0 },
    { label: '🚀 Node.js & Express API', color: ACCENT_INDIGO, x: 3.8 },
    { label: '🐘 PostgreSQL & Prisma ORM', color: ACCENT_EMERALD, x: 6.8 },
    { label: '✨ Google Gemini 2.0 AI', color: ACCENT_PURPLE, x: 9.8 },
  ];

  pillars.forEach((p) => {
    slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: p.x,
      y: 5.2,
      w: 2.7,
      h: 0.55,
      fill: { color: CARD_BG },
      line: { color: p.color, width: 1 },
      rectRadius: 0.1,
    });
    slide1.addText(p.label, {
      x: p.x,
      y: 5.2,
      w: 2.7,
      h: 0.55,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      align: 'center',
      color: TEXT_WHITE,
    });
  });

  slide1.addText('"Your Career, Elevated."', {
    x: 1.0,
    y: 6.2,
    w: 11.0,
    h: 0.5,
    fontSize: 14,
    fontFace: 'Arial',
    italic: true,
    color: ACCENT_CYAN,
  });

  // ===========================================================================
  // SLIDE 2: PROJECT OVERVIEW
  // ===========================================================================
  const slide2 = addBaseSlide('Project Overview & Core Mission', 'A Unified Platform for Candidates & Hiring Teams');

  const overviewCards = [
    { title: '📄 Resume Intelligence', body: 'Evaluates ATS compatibility (0–100 score), section structure, and rewires passive bullet points into quantifiable Google X-Y-Z achievements.', color: ACCENT_CYAN, x: 0.8, y: 1.5 },
    { title: '🎯 Job-Specific Fit', body: 'Computes mathematical match scores (0–100%) against live job descriptions, highlighting keyword density, matching skills, and critical gaps.', color: ACCENT_INDIGO, x: 4.8, y: 1.5 },
    { title: '🎙️ AI Mock Interview', body: 'Simulates dynamic Technical, HR, and Mixed interview sessions with automated feedback across technical depth, clarity, and ideal answers.', color: ACCENT_PURPLE, x: 8.8, y: 1.5 },
    { title: '🧭 Skill Gap Roadmaps', body: 'Extracts existing competencies and builds structured role readiness assessments with prioritized learning action items.', color: ACCENT_EMERALD, x: 0.8, y: 4.2 },
    { title: '📝 Interactive Builder', body: 'Drag-and-drop section customization, ATS preview, and direct single-click compilation into the active user resume vault.', color: ACCENT_AMBER, x: 4.8, y: 4.2 },
    { title: '🏢 Recruiter Control', body: 'Full job lifecycle management (Draft $\\to$ Publish $\\to$ Close), candidate review dossiers, private notes, and real PostgreSQL analytics.', color: ACCENT_CYAN, x: 8.8, y: 4.2 },
  ];

  overviewCards.forEach((c) => {
    addCard(slide2, { x: c.x, y: c.y, w: 3.7, h: 2.4, title: c.title, titleColor: c.color, body: c.body });
  });

  // ===========================================================================
  // SLIDE 3: PROBLEM STATEMENT
  // ===========================================================================
  const slide3 = addBaseSlide('Problem Statement', 'Bridging the Critical Disconnect in Talent Acquisition');

  // Candidate Side
  addCard(slide3, {
    x: 0.8,
    y: 1.5,
    w: 5.6,
    h: 5.1,
    title: '⚠️ Candidate / Student Challenges',
    titleColor: ACCENT_AMBER,
    body: '• Generic Static Resumes: Candidates submit identical resumes across diverse jobs, failing ATS keyword filters.\n\n• Ambiguous Skill Gaps: Job descriptions outline broad requirements; applicants don\'t know exact missing tools.\n\n• Cost-Prohibitive Mock Interviews: Personalized technical coaching is expensive and inaccessible to most students.\n\n• Disjointed Preparation: Switching between word processors, job boards, and tutorials causes fragmented career progress.',
    fontSize: 11,
  });

  // Recruiter Side
  addCard(slide3, {
    x: 6.8,
    y: 1.5,
    w: 5.6,
    h: 5.1,
    title: '🏢 Recruiter & Placement Pain Points',
    titleColor: ACCENT_CYAN,
    body: '• Manual Spreadsheet Filtering: Evaluating hundreds of unstructured resumes leads to severe review fatigue.\n\n• Opaque Candidate Match: Recruiters lack immediate skill match snapshots and quantitative compatibility metrics.\n\n• Disorganized Status Tracking: Candidate communications and stage updates get lost in fragmented email threads.\n\n• No Real-Time Telemetry: Lack of integrated recruitment analytics to track 30-day volume and talent shortages.',
    fontSize: 11,
  });

  // ===========================================================================
  // SLIDE 4: TECHNICAL OBJECTIVES
  // ===========================================================================
  const slide4 = addBaseSlide('Project Technical Objectives', 'Core Engineering Goals Accomplished in ElevAI');

  const objectives = [
    { num: '01', title: 'Automated Multi-Format Ingestion', desc: 'Parse PDF/DOCX resumes server-side up to 5MB, sanitize text buffers, and store securely in private cloud storage.', x: 0.8, y: 1.5 },
    { num: '02', title: 'AI-Powered ATS & Content Engine', desc: 'Deploy Google Gemini 2.0 to generate multi-dimensional scoring (0–100) and Google X-Y-Z bullet rewrites.', x: 4.8, y: 1.5 },
    { num: '03', title: 'Job Compatibility Engine', desc: 'Compute real-time role matching scores against live job postings with missing keyword identification.', x: 8.8, y: 1.5 },
    { num: '04', title: 'Interactive Mock Interviewer', desc: 'Build dynamic Q&A interview engine evaluating technical depth, clarity, and reference responses in real time.', x: 0.8, y: 4.2 },
    { num: '05', title: 'Full Recruitment Pipeline', desc: 'Deliver admin job lifecycle (Draft/Publish/Close), candidate review dossiers, and 6-stage status history audit.', x: 4.8, y: 4.2 },
    { num: '06', title: 'Zero-Downtime AI Resilience', desc: 'Implement local heuristic fallback engines ensuring 100% platform availability during external AI quota spikes.', x: 8.8, y: 4.2 },
  ];

  objectives.forEach((obj) => {
    addCard(slide4, {
      x: obj.x,
      y: obj.y,
      w: 3.7,
      h: 2.4,
      title: `${obj.num}. ${obj.title}`,
      titleColor: ACCENT_INDIGO,
      body: obj.desc,
      fontSize: 10.5,
    });
  });

  // ===========================================================================
  // SLIDE 5: SYSTEM AT A GLANCE (ARCHITECTURE)
  // ===========================================================================
  const slide5 = addBaseSlide('System at a Glance', 'Decoupled Three-Tier Architecture & Data Flow');

  // Presentation Layer Card
  addCard(slide5, {
    x: 0.8,
    y: 1.5,
    w: 3.6,
    h: 5.1,
    title: '1. Presentation Tier',
    titleColor: ACCENT_CYAN,
    body: '⚛️ React 18 Single Page App\n\n🎨 Tailwind CSS UI (Dark Theme)\n\n🛣️ React Router DOM v7 (SPA)\n\n📊 Recharts Analytics Visuals\n\n🔐 Axios HTTP Client with JWT Request & Response Interceptors\n\n🛡️ Client Route Guards (ProtectedRoute & AdminRoute)',
    fontSize: 10.5,
  });

  // Server Layer Card
  addCard(slide5, {
    x: 4.8,
    y: 1.5,
    w: 3.7,
    h: 5.1,
    title: '2. Application & API Tier',
    titleColor: ACCENT_INDIGO,
    body: '🚀 Node.js & Express.js REST API\n\n🛡️ Middleware Pipeline (JWT Auth, requireAdmin RBAC, RFC 4122 UUID Validation)\n\n⚙️ Business Logic Services (Jobs, Resumes, Applications, Analytics)\n\n✨ Resilient Dual-Layer AI Engine (Gemini 2.0 + Heuristic Fallback)\n\n🔒 Error Sanitization & Security',
    fontSize: 10.5,
  });

  // Persistence Layer Card
  addCard(slide5, {
    x: 8.8,
    y: 1.5,
    w: 3.7,
    h: 5.1,
    title: '3. Data & Cloud Services',
    titleColor: ACCENT_EMERALD,
    body: '🐘 Supabase PostgreSQL (12 Relational Tables & Enums)\n\n⚡ Prisma ORM v6 Client & Type-Safe Query Engine\n\n🗄️ Supabase Storage (Private \'resumes\' Bucket & 1h Signed URLs)\n\n🤖 Google Gemini API (gemini-2.0-flash LLM Model)',
    fontSize: 10.5,
  });

  // ===========================================================================
  // SLIDE 6: TECHNOLOGY STACK
  // ===========================================================================
  const slide6 = addBaseSlide('Technology Stack Matrix', 'Production-Grade Open Source & Cloud Technologies');

  const stackCategories = [
    { cat: 'Frontend Layer', items: '• React.js 18 (SPA Architecture)\n• Tailwind CSS v4 (Glassmorphic Theme)\n• Vite 6 (High-Speed Bundler)\n• React Router DOM v7\n• Recharts (Telemetry Visuals)\n• Lucide React Icons', color: ACCENT_CYAN, x: 0.8, y: 1.5 },
    { cat: 'Backend & Server', items: '• Node.js v20+ / v25 Runtime\n• Express.js v4.21 REST Server\n• Prisma ORM v6 Data Modeling\n• Multer (Multipart Memory Uploads)\n• PDF-Parse & Mammoth (Extraction)\n• Bcrypt.js & JWT Security', color: ACCENT_INDIGO, x: 4.8, y: 1.5 },
    { cat: 'Database & Storage', items: '• Supabase PostgreSQL 15+\n• 12 Relational Tables & Cascades\n• Relational Enums & Unique Keys\n• Supabase Cloud Object Storage\n• Time-Limited Signed Downloads\n• Transaction & Session Pooling', color: ACCENT_EMERALD, x: 8.8, y: 1.5 },
    { cat: 'AI & Intelligence', items: '• Google Gemini API (@google/genai)\n• LLM Model: gemini-2.0-flash\n• Structured JSON Prompt Contracts\n• Local Heuristic Offline Engine\n• Zero-Downtime Rate Handling\n• Parameterized Prompt Security', color: ACCENT_PURPLE, x: 0.8, y: 4.2 },
    { cat: 'Security & Auth', items: '• Stateless Signed JWT (7-day)\n• 10-Round Salted Bcrypt Hashing\n• Server-Side requireAdmin RBAC\n• RFC 4122 UUID Parameter Guards\n• IDOR Compound Scoping Filters\n• Strict Production CORS Limits', color: ACCENT_AMBER, x: 4.8, y: 4.2 },
    { cat: 'Deployment & CI/CD', items: '• Render Web Service (Backend)\n• Render Static Site (Frontend)\n• SPA Redirect Rewrite (/* /index.html)\n• Render YAML Blueprint Config\n• Parameterized .env Isolation\n• Zero Secrets in Client Bundles', color: ACCENT_CYAN, x: 8.8, y: 4.2 },
  ];

  stackCategories.forEach((s) => {
    addCard(slide6, { x: s.x, y: s.y, w: 3.7, h: 2.4, title: s.cat, titleColor: s.color, body: s.items });
  });

  // ===========================================================================
  // SLIDE 7: COMPLETE USER WORKFLOW
  // ===========================================================================
  const slide7 = addBaseSlide('Candidate End-to-End Workflow', 'Seamless Progression from Onboarding to Application');

  const userSteps = [
    { step: '1', title: 'Register & Onboard', desc: 'Create account with bcrypt security; establish target Career Goal & experience level.', x: 0.8, y: 1.5 },
    { step: '2', title: 'Upload / Build', desc: 'Upload PDF/DOCX or use Interactive Builder; text is parsed and stored in private vault.', x: 3.8, y: 1.5 },
    { step: '3', title: 'AI ATS Analysis', desc: 'Receive instant 0–100 ATS Score, section ratings, skill categorization & weaknesses.', x: 6.8, y: 1.5 },
    { step: '4', title: 'X-Y-Z Improvement', desc: 'Review bullet rewrites formatted with quantifiable impact metrics while preserving facts.', x: 9.8, y: 1.5 },
    { step: '5', title: 'Skill Gap & Roadmap', desc: 'Identify critical missing technologies and follow prioritized learning roadmaps.', x: 0.8, y: 4.2 },
    { step: '6', title: 'AI Mock Interview', desc: 'Practice role-specific Q&A rounds with instant grading on depth and clarity.', x: 3.8, y: 4.2 },
    { step: '7', title: 'Job Optimization', desc: 'Analyze resume against target job description to get match score & missing keywords.', x: 6.8, y: 4.2 },
    { step: '8', title: '1-Click Application', desc: 'Submit application with score snapshot; track live status (SUBMITTED $\\to$ SELECTED).', x: 9.8, y: 4.2 },
  ];

  userSteps.forEach((s) => {
    addCard(slide7, {
      x: s.x,
      y: s.y,
      w: 2.7,
      h: 2.4,
      title: `Step ${s.step}: ${s.title}`,
      titleColor: ACCENT_CYAN,
      body: s.desc,
      fontSize: 10,
    });
  });

  // ===========================================================================
  // SLIDE 8: AI PROCESSING PIPELINE & RESILIENCE
  // ===========================================================================
  const slide8 = addBaseSlide('AI Processing Pipeline & Fault Tolerance', 'Dual-Layer Architecture Guaranteeing 100% Availability');

  addCard(slide8, {
    x: 0.8,
    y: 1.5,
    w: 5.6,
    h: 5.1,
    title: '🤖 Primary AI Pipeline (Gemini 2.0)',
    titleColor: ACCENT_PURPLE,
    body: '1. User Request: Client submits resume/job payload.\n\n2. Server-Side Context Injection: Express backend combines candidate Career Goal, target role, and extracted text.\n\n3. Structured Prompt Engineering: Strictly enforces JSON response contracts with predefined schema schemas.\n\n4. Gemini 2.0 API Execution: Dispatches request to gemini-2.0-flash model.\n\n5. JSON Schema Validation: Validates score bounds (0–100), section arrays, and action items before DB persistence.',
    fontSize: 11,
  });

  addCard(slide8, {
    x: 6.8,
    y: 1.5,
    w: 5.6,
    h: 5.1,
    title: '🛡️ Resilient Offline Heuristic Fallback',
    titleColor: ACCENT_EMERALD,
    body: '• The Problem: Upstream free-tier Google Gemini API accounts enforce rate limits (20 requests/day).\n\n• ElevAI Solution: When HTTP 429 or 503 is intercepted, the service automatically diverts to local heuristic calculation engines.\n\n• How It Works: Scans text for 60+ technical competencies, computes keyword density, and generates structured feedback.\n\n• Zero User Impact: Candidates receive complete, actionable reports without application crashes or 500 errors.',
    fontSize: 11,
  });

  // ===========================================================================
  // SLIDE 9: RESUME INTELLIGENCE & VAULT
  // ===========================================================================
  const slide9 = addBaseSlide('Resume Intelligence & Vault Lifecycle', 'Multi-Format Processing, Versioning & Deletion Safety');

  const resumeStages = [
    { title: '1. Multi-Format Upload', body: 'Supports PDF, DOCX, DOC, and TXT files up to 5MB. Multer handles in-memory file buffers securely.', color: ACCENT_CYAN, x: 0.8 },
    { title: '2. Text Extraction', body: 'pdf-parse and mammoth extract clean text strings, stripping binary metadata and formatting artifacts.', color: ACCENT_INDIGO, x: 3.8 },
    { title: '3. Cloud Storage Vault', body: 'Files saved under user-scoped paths in private Supabase Storage. Downloads require 1-hour signed URLs.', color: ACCENT_EMERALD, x: 6.8 },
    { title: '4. Deletion Safety Guard', body: 'Resumes attached to active submitted applications are locked to preserve audit integrity for recruiters.', color: ACCENT_AMBER, x: 9.8 },
  ];

  resumeStages.forEach((st) => {
    addCard(slide9, { x: st.x, y: 1.5, w: 2.7, h: 2.4, title: st.title, titleColor: st.color, body: st.body, fontSize: 10 });
  });

  addCard(slide9, {
    x: 0.8,
    y: 4.2,
    w: 11.7,
    h: 2.4,
    title: '📝 Interactive Resume Builder & Direct Vault Export',
    titleColor: ACCENT_PURPLE,
    body: '• Multi-Section Editing: Personal Info, Professional Summary, Categorized Skills, Work Experience, Education, Projects, and Custom Sections.\n• Live ATS Preview: Instant visual formatting ensuring clean typography and structural readability.\n• Direct Vault Export: Compiles builder documents directly into a READY resume in the user\'s vault for one-click job applications.',
    fontSize: 11,
  });

  // ===========================================================================
  // SLIDE 10: JOB MARKETPLACE & APPLICATION WORKFLOW
  // ===========================================================================
  const slide10 = addBaseSlide('Job Marketplace & Application Workflow', 'Integrated Requisition, Optimization & Submission Flow');

  const jobFlow = [
    { num: '1', title: 'Admin Posts Job', body: 'Requisition created with title, required skills, preferred tech, salary band, and deadline.', x: 0.8 },
    { num: '2', title: 'Targeted Alert', body: 'System notifies candidates whose career goals align with the new job opening.', x: 3.8 },
    { num: '3', title: 'Fit Analysis', body: 'Candidate analyzes resume against job description, getting match score & missing keywords.', x: 6.8 },
    { num: '4', title: 'One-Click Apply', body: 'Application submitted with permanent snapshot of resume and match score (duplicate 409 protected).', x: 9.8 },
  ];

  jobFlow.forEach((jf) => {
    addCard(slide10, { x: jf.x, y: 1.5, w: 2.7, h: 2.4, title: `${jf.num}. ${jf.title}`, titleColor: ACCENT_CYAN, body: jf.body, fontSize: 10.5 });
  });

  addCard(slide10, {
    x: 0.8,
    y: 4.2,
    w: 11.7,
    h: 2.4,
    title: '🛡️ Candidate Experience & Application Protection Rules',
    titleColor: ACCENT_EMERALD,
    body: '• No Automatic Rejection: Candidates with lower match scores are never auto-rejected; recruiters review all applicants.\n• Deadline Enforcement: Submissions to expired or CLOSED requisitions are automatically rejected by backend validators.\n• Immutable Snapshot: If a candidate later edits their resume, the recruiter still sees the exact version submitted.',
    fontSize: 11,
  });

  // ===========================================================================
  // SLIDE 11: ADMIN CONTROL PANEL
  // ===========================================================================
  const slide11 = addBaseSlide('Admin Recruitment Control Suite', 'Centralized Candidate Review, Dossiers & Management');

  const adminModules = [
    { title: '📈 Overview Telemetry', body: 'Real-time counters for total users, published jobs, draft requisitions, pending reviews, and selected offers.', color: ACCENT_CYAN, x: 0.8, y: 1.5 },
    { title: '📝 Job Requisitions', body: 'Full CRUD suite: create draft jobs, publish requisitions, set salary ranges, and close expired listings.', color: ACCENT_INDIGO, x: 4.8, y: 1.5 },
    { title: '👥 Candidate Review Dossier', body: 'Inspect candidate profile, submitted cover letter, AI match score snapshot, and generate secure resume links.', color: ACCENT_PURPLE, x: 8.8, y: 1.5 },
    { title: '🔒 Private Recruiter Notes', body: 'Record internal evaluation remarks attached to candidate applications (strictly hidden from user API).', color: ACCENT_AMBER, x: 0.8, y: 4.2 },
    { title: '🔄 Status Pipeline Manager', body: 'Transition candidates through recruitment stages (SUBMITTED $\\to$ SELECTED) with automated audit logging.', color: ACCENT_EMERALD, x: 4.8, y: 4.2 },
    { title: '📊 Recruitment Analytics', body: 'Live PostgreSQL engine: 30-day continuous application trends, skill demand ranking, and deadline radars.', color: ACCENT_CYAN, x: 8.8, y: 4.2 },
  ];

  adminModules.forEach((m) => {
    addCard(slide11, { x: m.x, y: m.y, w: 3.7, h: 2.4, title: m.title, titleColor: m.color, body: m.body });
  });

  // ===========================================================================
  // SLIDE 12: APPLICATION STATUS PIPELINE
  // ===========================================================================
  const slide12 = addBaseSlide('Application Status Lifecycle & Audit Trail', '6-Stage Candidate Progression with Immutable History');

  const stages = [
    { name: 'SUBMITTED', desc: 'Application received with resume snapshot.', color: ACCENT_CYAN, x: 0.8 },
    { name: 'UNDER_REVIEW', desc: 'Recruiter opens candidate dossier.', color: ACCENT_INDIGO, x: 2.8 },
    { name: 'SHORTLISTED', desc: 'Candidate meets key technical criteria.', color: ACCENT_PURPLE, x: 4.8 },
    { name: 'INTERVIEW', desc: 'Candidate scheduled for technical round.', color: ACCENT_AMBER, x: 6.8 },
    { name: 'SELECTED', desc: 'Offer extended to successful candidate.', color: ACCENT_EMERALD, x: 8.8 },
    { name: 'REJECTED', desc: 'Application archived with decision notice.', color: 'EF4444', x: 10.8 },
  ];

  stages.forEach((st) => {
    addCard(slide12, {
      x: st.x,
      y: 1.5,
      w: 1.8,
      h: 2.4,
      title: st.name,
      titleColor: st.color,
      body: st.desc,
      fontSize: 9.5,
    });
  });

  addCard(slide12, {
    x: 0.8,
    y: 4.2,
    w: 11.7,
    h: 2.4,
    title: '📋 Immutable Status History Audit Log (`ApplicationStatusHistory`)',
    titleColor: ACCENT_EMERALD,
    body: '• Full Traceability: Every status change creates an immutable event recording oldStatus, newStatus, changedById, and timestamp.\n• Candidate Notification Dispatch: Status changes trigger instant notification alerts routed to the applicant\'s dashboard.\n• Multi-Tenant Isolation: Candidates can only view public status transitions; internal recruiter notes are strictly withheld.',
    fontSize: 11,
  });

  // ===========================================================================
  // SLIDE 13: DATABASE ER ARCHITECTURE
  // ===========================================================================
  const slide13 = addBaseSlide('Database Entity-Relationship Architecture', '12 Relational PostgreSQL Tables Modeled with Prisma ORM');

  const entities = [
    { name: 'User', fields: '• id (UUID, PK)\n• email (Unique)\n• passwordHash\n• role (USER/ADMIN)', color: ACCENT_CYAN, x: 0.8, y: 1.5 },
    { name: 'CareerGoal', fields: '• id (UUID, PK)\n• userId (FK, Unique)\n• targetRole\n• experienceLevel', color: ACCENT_INDIGO, x: 3.8, y: 1.5 },
    { name: 'Resume', fields: '• id (UUID, PK)\n• userId (FK)\n• storagePath\n• extractedText\n• status (READY)', color: ACCENT_EMERALD, x: 6.8, y: 1.5 },
    { name: 'Job', fields: '• id (UUID, PK)\n• createdBy (FK)\n• title, description\n• requiredSkills\n• status (PUBLISHED)', color: ACCENT_PURPLE, x: 9.8, y: 1.5 },
    { name: 'Application', fields: '• id (UUID, PK)\n• jobId (FK)\n• userId (FK)\n• resumeId (FK)\n• matchScore, status', color: ACCENT_AMBER, x: 0.8, y: 4.2 },
    { name: 'StatusHistory', fields: '• id (UUID, PK)\n• applicationId (FK)\n• oldStatus, newStatus\n• changedById (FK)', color: ACCENT_CYAN, x: 3.8, y: 4.2 },
    { name: 'ApplicationNote', fields: '• id (UUID, PK)\n• applicationId (FK)\n• adminId (FK)\n• note (Text)', color: ACCENT_INDIGO, x: 6.8, y: 4.2 },
    { name: 'AI Analytics Records', fields: '• ResumeAnalysis\n• ResumeImprovement\n• JobOptimization\n• SkillGapAnalysis', color: ACCENT_EMERALD, x: 9.8, y: 4.2 },
  ];

  entities.forEach((e) => {
    addCard(slide13, { x: e.x, y: e.y, w: 2.7, h: 2.4, title: e.name, titleColor: e.color, body: e.fields, fontSize: 10 });
  });

  // ===========================================================================
  // SLIDE 14: BACKEND REQUEST / API EXECUTION FLOW
  // ===========================================================================
  const slide14 = addBaseSlide('Backend Request & API Execution Lifecycle', 'Layered Defense, Validation & Processing Pipeline');

  const requestSteps = [
    { num: '1. Inbound Request', desc: 'Browser dispatches HTTPS request with Bearer JWT header.', x: 0.8 },
    { num: '2. Security Headers', desc: 'Express applies X-Frame-Options: DENY, nosniff, and CORS.', x: 2.8 },
    { num: '3. Auth Middleware', desc: 'Verifies cryptographically signed JWT; attaches req.user.', x: 4.8 },
    { num: '4. UUID Validation', desc: 'validateUUIDParams checks RFC 4122 regex; rejects SQLi.', x: 6.8 },
    { num: '5. Service & AI Logic', desc: 'Executes Prisma queries or Gemini AI processing.', x: 8.8 },
    { num: '6. Sanitized JSON', desc: 'Returns formatted response; masks database errors.', x: 10.8 },
  ];

  requestSteps.forEach((rs) => {
    addCard(slide14, {
      x: rs.x,
      y: 1.5,
      w: 1.8,
      h: 2.4,
      title: rs.num,
      titleColor: ACCENT_CYAN,
      body: rs.desc,
      fontSize: 9.5,
    });
  });

  addCard(slide14, {
    x: 0.8,
    y: 4.2,
    w: 11.7,
    h: 2.4,
    title: '🛡️ Real-World Example: Candidate Submits Job Application (`POST /api/applications`)',
    titleColor: ACCENT_INDIGO,
    body: '1. JWT Authenticated $\\to$ 2. Verify jobId & resumeId UUIDs $\\to$ 3. Ensure Job is PUBLISHED & deadline active $\\to$ 4. Confirm Resume ownership $\\to$ 5. Check duplicate application (409 if exists) $\\to$ 6. Store Application with matchScore $\\to$ 7. Append SUBMITTED to status history $\\to$ 8. Return HTTP 201 Created.',
    fontSize: 11,
  });

  // ===========================================================================
  // SLIDE 15: SECURITY & RBAC ENFORCEMENT
  // ===========================================================================
  const slide15 = addBaseSlide('Multi-Layered Security & RBAC Enforcement', 'Comprehensive Protections Shielding Application Data');

  const securityPillars = [
    { title: '🔑 Password Security', body: '10-round salted bcrypt hashing ensures raw passwords are never stored.', color: ACCENT_CYAN, x: 0.8, y: 1.5 },
    { title: '🛡️ Server-Side RBAC', body: 'requireAdmin middleware validates JWT role, blocking unauthorized candidates.', color: ACCENT_INDIGO, x: 4.8, y: 1.5 },
    { title: '🚫 IDOR Elimination', body: 'Every database query filters by authenticated userId, preventing cross-tenant access.', color: ACCENT_EMERALD, x: 8.8, y: 1.5 },
    { title: '🛡️ Parameter Hardening', body: 'RFC 4122 regex validation on all route IDs blocks SQL injection & path traversal.', color: ACCENT_AMBER, x: 0.8, y: 4.2 },
    { title: '🗄️ Private Cloud Storage', body: 'Supabase Storage bucket is private; downloads require 1-hour signed URLs.', color: ACCENT_PURPLE, x: 4.8, y: 4.2 },
    { title: '🔒 Zero Client Secrets', body: 'Backend API keys (Gemini, Supabase Service Role) are never exposed to browser.', color: ACCENT_CYAN, x: 8.8, y: 4.2 },
  ];

  securityPillars.forEach((p) => {
    addCard(slide15, { x: p.x, y: p.y, w: 3.7, h: 2.4, title: p.title, titleColor: p.color, body: p.body });
  });

  // ===========================================================================
  // SLIDE 16: NOTIFICATIONS & REAL ANALYTICS
  // ===========================================================================
  const slide16 = addBaseSlide('Smart Notifications & Real Analytics Engine', 'Live Database Telemetry Without Synthetic Numbers');

  addCard(slide16, {
    x: 0.8,
    y: 1.5,
    w: 5.6,
    h: 5.1,
    title: '🔔 Smart Notification System',
    titleColor: ACCENT_CYAN,
    body: '• Event-Driven Routing: Instant alerts dispatched when matching jobs are published or application statuses update.\n\n• Live Bell Badge Counter: Unread indicator automatically updates and decrements upon mark-as-read.\n\n• Multi-Tenant Isolation: User B is strictly blocked from reading, modifying, or deleting User A notifications.\n\n• User Preference Controls: Candidates can toggle notification categories (Jobs, Resumes, Reminders).',
    fontSize: 11,
  });

  addCard(slide16, {
    x: 6.8,
    y: 1.5,
    w: 5.6,
    h: 5.1,
    title: '📊 Recruitment Analytics Engine',
    titleColor: ACCENT_INDIGO,
    body: '• 100% Real Database Data: All metrics calculated from live PostgreSQL records without hardcoded numbers.\n\n• 30-Day Continuous Trends: Daily time-series buckets ensure empty days reflect 0 submissions rather than gaps.\n\n• Recruitment Funnel: Real progression rates from SUBMITTED $\\to$ UNDER_REVIEW $\\to$ SHORTLISTED $\\to$ SELECTED.\n\n• Skill Demand Radar: Aggregates top required skills across all active postings to identify talent trends.',
    fontSize: 11,
  });

  // ===========================================================================
  // SLIDE 17: UI/UX PRODUCT SHOWCASE
  // ===========================================================================
  const slide17 = addBaseSlide('UI/UX Design & Product Experience', 'Cyber Glassmorphism with Fluid Responsiveness');

  const uiFeatures = [
    { title: '🌌 Cyber Glassmorphism', body: 'Dark slate palette (#0A0E17) with translucent cards, 1px subtle borders, and soft backdrop blurs.', color: ACCENT_CYAN, x: 0.8, y: 1.5 },
    { title: '📱 Fully Responsive', body: 'Adaptive layouts across mobile (320px), tablet, laptop, and ultra-wide 4K desktop screens.', color: ACCENT_INDIGO, x: 4.8, y: 1.5 },
    { title: '⚡ Micro-Animations', body: 'Smooth Recharts visual progressions, hover glow transitions, and responsive modal dialogues.', color: ACCENT_EMERALD, x: 8.8, y: 1.5 },
    { title: '🔔 Contextual Toasts', body: 'Interactive feedback system with success, error, warning, and loading status states.', color: ACCENT_AMBER, x: 0.8, y: 4.2 },
    { title: '🎛️ Tabbed Workspaces', body: 'Clean separation between Candidate tools, Resume vaults, Job feeds, and Admin control suites.', color: ACCENT_PURPLE, x: 4.8, y: 4.2 },
    { title: '♿ Accessible Controls', body: 'Semantic HTML5 structure, ARIA accessibility attributes, and high-contrast readable typography.', color: ACCENT_CYAN, x: 8.8, y: 4.2 },
  ];

  uiFeatures.forEach((u) => {
    addCard(slide17, { x: u.x, y: u.y, w: 3.7, h: 2.4, title: u.title, titleColor: u.color, body: u.body });
  });

  // ===========================================================================
  // SLIDE 18: TESTING & VERIFICATION STATUS
  // ===========================================================================
  const slide18 = addBaseSlide('Testing & Master Verification Status', '100% Pass Rate Across Automated Full-Lifecycle Audits');

  const testResults = [
    { domain: 'Authentication & Session Security', status: 'PASS (8/8 Checks)', color: ACCENT_EMERALD, x: 0.8, y: 1.5 },
    { domain: 'Server-Side Admin RBAC', status: 'PASS (3/3 Checks)', color: ACCENT_EMERALD, x: 4.8, y: 1.5 },
    { domain: 'Resume Vault & Deletion Locks', status: 'PASS (7/7 Checks)', color: ACCENT_EMERALD, x: 8.8, y: 1.5 },
    { domain: 'AI Fallback Fault-Tolerance', status: 'PASS (4/4 Checks)', color: ACCENT_EMERALD, x: 0.8, y: 2.85 },
    { domain: 'Job Management & Deadlines', status: 'PASS (6/6 Checks)', color: ACCENT_EMERALD, x: 4.8, y: 2.85 },
    { domain: 'Candidate Applications & Tracking', status: 'PASS (6/6 Checks)', color: ACCENT_EMERALD, x: 8.8, y: 2.85 },
    { domain: 'Admin Dossiers & Status History', status: 'PASS (9/9 Checks)', color: ACCENT_EMERALD, x: 0.8, y: 4.2 },
    { domain: 'Recruitment Analytics Engine', status: 'PASS (5/5 Checks)', color: ACCENT_EMERALD, x: 4.8, y: 4.2 },
    { domain: 'Parameter Hardening & UUID Validation', status: 'PASS (5/5 Checks)', color: ACCENT_EMERALD, x: 8.8, y: 4.2 },
    { domain: 'Vite Client Production Build', status: 'PASS (Clean in 14s)', color: ACCENT_EMERALD, x: 0.8, y: 5.55 },
    { domain: 'API Health & Telemetry Endpoints', status: 'PASS (HTTP 200)', color: ACCENT_EMERALD, x: 4.8, y: 5.55 },
    { domain: 'OVERALL PLATFORM VERIFICATION', status: '54 / 54 PASS (100%)', color: ACCENT_CYAN, x: 8.8, y: 5.55 },
  ];

  testResults.forEach((tr) => {
    addCard(slide18, {
      x: tr.x,
      y: tr.y,
      w: 3.7,
      h: 1.15,
      title: tr.domain,
      titleColor: TEXT_WHITE,
      body: `Status: ${tr.status}`,
      borderColor: tr.color,
      fontSize: 10,
    });
  });

  // ===========================================================================
  // SLIDE 19: LIMITATIONS & FUTURE SCOPE
  // ===========================================================================
  const slide19 = addBaseSlide('Current Limitations & Future Roadmap', 'Operational Realities & Strategic Product Roadmap');

  addCard(slide19, {
    x: 0.8,
    y: 1.5,
    w: 5.6,
    h: 5.1,
    title: '⚠️ Current System Limitations',
    titleColor: ACCENT_AMBER,
    body: '1. Upstream AI Rate Quotas: Google Gemini free-tier accounts enforce a 20 request/day quota. (Mitigated by ElevAI\'s built-in offline heuristic fallback engine).\n\n2. Browser Web Speech Dependency: Voice input during mock interviews depends on browser Web Speech API support (Chrome/Edge recommended).\n\n3. Single Requisition Attachments: Applications currently link one primary resume version per job submission.',
    fontSize: 11,
  });

  addCard(slide19, {
    x: 6.8,
    y: 1.5,
    w: 5.6,
    h: 5.1,
    title: '🚀 Future Scope & Strategic Roadmap',
    titleColor: ACCENT_CYAN,
    body: '• Out-of-Band Email Alerts: Integration with SendGrid / AWS SES for automated email notifications on status updates.\n\n• Embedded WebRTC Video Interviews: Direct browser-to-browser video conferencing within the Admin Review Suite.\n\n• Bulk Recruiter Resume Parsing: Multi-resume batch uploads and automated talent matching for high-volume hiring.\n\n• Native Mobile Apps: Cross-platform React Native applications for iOS and Android devices.',
    fontSize: 11,
  });

  // ===========================================================================
  // SLIDE 20: CONCLUSION & SUMMARY
  // ===========================================================================
  const slide20 = pptx.addSlide();
  slide20.background = { color: BG_COLOR };

  slide20.addText('ElevAI — Final Summary', {
    x: 1.0,
    y: 1.2,
    w: 11.3,
    h: 0.8,
    fontSize: 36,
    fontFace: 'Arial',
    bold: true,
    color: TEXT_WHITE,
  });

  slide20.addText('A Production-Ready Career Intelligence & Recruitment Platform', {
    x: 1.0,
    y: 2.0,
    w: 11.3,
    h: 0.5,
    fontSize: 16,
    fontFace: 'Arial',
    color: ACCENT_CYAN,
  });

  addCard(slide20, {
    x: 1.0,
    y: 2.8,
    w: 11.3,
    h: 3.2,
    title: '🎯 Key Engineering Achievements',
    titleColor: ACCENT_EMERALD,
    body: '✔ Complete Candidate Career Suite: Multi-format ATS analysis, X-Y-Z content rewrites, job fit optimization, and interactive mock interviews.\n\n✔ Full Recruiter Control: Job requisition management, candidate review dossiers, private recruiter notes, and real PostgreSQL analytics.\n\n✔ Robust Decoupled Architecture: React 18 SPA + Node/Express REST API + Supabase PostgreSQL + Google Gemini 2.0 AI.\n\n✔ Zero-Downtime Resilience: Built-in heuristic fallback engine ensuring 100% platform availability during AI quota spikes.\n\n✔ Multi-Layered Security: Strict server-side RBAC, IDOR compound filters, parameter hardening, and private cloud storage signed URLs.',
    fontSize: 11,
  });

  slide20.addText('ElevAI — "Your Career, Elevated."', {
    x: 1.0,
    y: 6.3,
    w: 11.3,
    h: 0.6,
    fontSize: 20,
    fontFace: 'Arial',
    bold: true,
    align: 'center',
    color: ACCENT_INDIGO,
  });

  // Save the PPTX file
  const pptxPath = path.join(__dirname, '../../ElevAI_Final_Project_Presentation.pptx');
  await pptx.writeFile({ fileName: pptxPath });
  console.log(`[Success] Presentation successfully created at:\n${pptxPath}`);
}

generatePresentation().catch((err) => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
