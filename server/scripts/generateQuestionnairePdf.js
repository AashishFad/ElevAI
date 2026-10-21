const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', '..', 'ElevAI_Viva_and_Technical_Defense_Questionnaire.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 45, left: 45, right: 45 },
  bufferPages: true,
  info: {
    Title: 'ElevAI - Master Viva & Technical Defense Questionnaire',
    Author: 'ElevAI Engineering Team',
    Subject: 'Project Viva, Architecture, Backend Workflows & Technical Defense',
    Keywords: 'ElevAI, Viva, Architecture, Backend Workflows, Node.js, Express, React, PostgreSQL, Gemini AI'
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const C = {
  primary: '#0B0F19',
  cardBg: '#F8FAFC',
  cardBorder: '#E2E8F0',
  indigo: '#4338CA',
  indigoBg: '#EEF2FF',
  cyan: '#0284C7',
  emerald: '#047857',
  emeraldBg: '#ECFDF5',
  amber: '#B45309',
  amberBg: '#FFFBEB',
  darkText: '#0F172A',
  bodyText: '#334155',
  mutedText: '#64748B',
  white: '#FFFFFF',
  line: '#CBD5E1'
};

const pageWidth = doc.page.width - 90; // 505 pt

function checkPage(requiredSpace = 80) {
  if (doc.y + requiredSpace > doc.page.height - 45) {
    doc.addPage();
  }
}

// Cover / Header Banner
function renderHeader() {
  doc.rect(45, 40, pageWidth, 85).fill(C.primary);

  doc.rect(55, 50, 150, 18).fillAndStroke(C.cyan, C.cyan);
  doc.fillColor(C.white).fontSize(8).font('Helvetica-Bold')
     .text('ELEVAI TECHNICAL DEFENSE', 60, 55);

  doc.fillColor(C.white).fontSize(16).font('Helvetica-Bold')
     .text('Master Viva & Backend Architecture Questionnaire', 55, 75);

  doc.fillColor('#94A3B8').fontSize(9).font('Helvetica')
     .text('Complete Guide: System Architecture, AI Pipelines, Backend Workflows, Database & Defense Answers', 55, 98);

  doc.y = 140;
}

function renderSectionHeader(number, title, subtitle) {
  checkPage(90);
  doc.moveDown(0.8);
  
  const y = doc.y;
  doc.rect(45, y, pageWidth, 26).fill(C.indigoBg);
  doc.rect(45, y, 4, 26).fill(C.indigo);

  doc.fillColor(C.indigo).fontSize(11).font('Helvetica-Bold')
     .text(`SECTION ${number}: ${title.toUpperCase()}`, 55, y + 7);

  doc.y = y + 32;
  if (subtitle) {
    doc.fillColor(C.mutedText).fontSize(8.5).font('Helvetica-Oblique')
       .text(subtitle, 45, doc.y, { width: pageWidth });
    doc.moveDown(0.4);
  }
}

function renderQA(qNum, question, answer, bullets = [], note = null) {
  checkPage(120);
  doc.moveDown(0.6);

  // Question Title
  const qY = doc.y;
  doc.fillColor(C.darkText).fontSize(10).font('Helvetica-Bold')
     .text(`Q${qNum}: ${question}`, 45, qY, { width: pageWidth });
  
  doc.moveDown(0.3);

  // Answer Text
  doc.fillColor(C.bodyText).fontSize(9).font('Helvetica')
     .text(answer, 45, doc.y, { width: pageWidth, lineGap: 2.5 });

  // Bullets if any
  if (bullets && bullets.length > 0) {
    doc.moveDown(0.3);
    bullets.forEach(b => {
      checkPage(30);
      const bY = doc.y;
      doc.fillColor(C.indigo).fontSize(9).font('Helvetica-Bold').text('• ', 52, bY);
      doc.fillColor(C.bodyText).fontSize(8.5).font('Helvetica')
         .text(b, 62, bY, { width: pageWidth - 17, lineGap: 2 });
      doc.moveDown(0.2);
    });
  }

  // Note Box if any
  if (note) {
    checkPage(45);
    doc.moveDown(0.3);
    const nY = doc.y;
    doc.rect(45, nY, pageWidth, 28).fillAndStroke(C.amberBg, '#FDE68A');
    doc.fillColor(C.amber).fontSize(8).font('Helvetica-Bold').text('EXAMINER TIP: ', 55, nY + 8, { continued: true });
    doc.fillColor(C.bodyText).fontSize(8).font('Helvetica').text(note, { width: pageWidth - 20 });
    doc.y = nY + 34;
  }

  // Divider
  doc.moveDown(0.4);
  doc.strokeColor(C.cardBorder).lineWidth(0.5).moveTo(45, doc.y).lineTo(45 + pageWidth, doc.y).stroke();
}

// -------------------------------------------------------------
// BUILD DOCUMENT CONTENT
// -------------------------------------------------------------

renderHeader();

// SECTION 1
renderSectionHeader(1, 'Backend Request-Response Lifecycle & Execution', 'Step-by-step trace of incoming requests through the Express middleware pipeline');

renderQA(
  1,
  'Walk me through the exact lifecycle of an HTTP request when it hits your backend server.',
  'When a candidate or admin performs any action in the React frontend, the request travels through this exact step-by-step pipeline:',
  [
    'CORS & Security Check: The request arrives at Node.js/Express. cors() validates if the origin is authorized (localhost:5173 or production domain).',
    'Body Parsing: express.json() and express.urlencoded() parse JSON payloads into accessible req.body objects.',
    'Multer Interception (If File Upload): For resume uploads, multer intercepts multipart/form-data, validates MIME-type (application/pdf) & size (<= 5MB), and loads the file into memory as req.file.buffer.',
    'Authentication Middleware (authenticateToken): Extracts "Authorization: Bearer <token>", verifies the signature using jwt.verify() with JWT_SECRET, and attaches decoded user to req.user.',
    'Role Authorization Guard (requireAdmin): On admin routes, checks req.user.role === "admin". Blocks candidates with HTTP 403 Forbidden.',
    'Route Controller & Service Logic: Executes core business logic, database queries via Supabase client, or external AI API calls to Gemini.',
    'Response Dispatch: Returns standardized JSON payload { success: true, data: ... } with HTTP 200/201.',
    'Global Error Middleware: If any unhandled exception occurs, the central error middleware catches it and returns HTTP 500 without crashing.'
  ],
  'Mention the exact order: CORS -> JSON Parser -> Multer -> JWT Auth -> RBAC -> Controller -> Database/AI -> Response.'
);

renderQA(
  2,
  'How does the backend handle asynchronous operations without blocking the single-threaded Node.js event loop?',
  'Node.js runs on a single-threaded non-blocking Event Loop. All I/O-intensive operations (database queries in Supabase, API calls to Google Gemini, and cloud storage file uploads) are written using async/await and Promises.',
  [
    'Non-Blocking Offloading: When an async task begins, Node offloads the socket I/O to libuv background threads, freeing the main thread to handle other users.',
    'Microtask Callback Queue: When Gemini or PostgreSQL finishes, the callback is pushed to the event microtask queue and resumes execution immediately.'
  ]
);

// SECTION 2
renderSectionHeader(2, 'Resume Processing & ATS Scorer Backend Workflow', 'Detailed mechanics of file upload, memory buffering, text parsing, and AI analysis');

renderQA(
  3,
  'Explain the step-by-step backend workflow when a candidate uploads a resume.',
  'The resume upload pipeline processes the file entirely in-memory and pushes it to both cloud storage and the AI engine:',
  [
    '1. Form-Data Upload: Client sends POST /api/resumes/upload with multipart/form-data containing the PDF and Bearer JWT.',
    '2. In-Memory Buffering: Multer memoryStorage intercepts the file stream, validates application/pdf MIME-type and <= 5MB limit, and buffers it in req.file.buffer.',
    '3. Text Extraction: The backend passes the memory buffer to pdf-parse, extracting raw resume text, sections, and bullet points into a clean string.',
    '4. Cloud Storage Upload: The binary buffer is streamed to the Supabase Storage private bucket under "resumes/{userId}_{timestamp}.pdf", generating a secure URL.',
    '5. AI ATS Scoring: The extracted text is injected into an ATS prompt and sent to Google Gemini 1.5 Flash.',
    '6. JSON Sanitization & Validation: The backend cleans markdown backticks and validates { ats_score (0-100), strengths, improvements, missing_keywords }.',
    '7. Database Persistence: An INSERT query saves user_id, file_url, file_name, extracted_text, ats_score, and feedback_json into the resumes table.',
    '8. Response: Returns HTTP 201 Created with the calculated ATS score and full scorecard.'
  ]
);

renderQA(
  4,
  'Why do you process the PDF in memory with Multer instead of saving it to disk first?',
  'Processing in memory provides three critical engineering advantages:',
  [
    'Ephemeral Cloud Disk Compatibility: Cloud platforms (Render, Heroku) have temporary file systems that wipe local files on restart or scaling.',
    'High Performance & Zero Disk I/O: In-memory buffer operations avoid slow physical hard drive read/write cycles, cutting latency by 3x.',
    'Security & Privacy: Candidate resumes are never left exposed in local server folders where they could lead to data leaks.'
  ]
);

// SECTION 3
renderSectionHeader(3, 'AI Mock Interview Engine Backend Workflow', 'Question generation, answer evaluation, prompt resilience, and rubrics');

renderQA(
  5,
  'How is an AI mock interview generated and saved in the backend?',
  'The interview creation lifecycle executes in 5 precise steps:',
  [
    '1. Payload Reception: Client sends { domain: "Fullstack", difficulty: "Medium", count: 5 } to POST /api/interview/generate.',
    '2. Prompt Construction: Backend builds a strict zero-shot prompt requiring Gemini to return ONLY a valid JSON array of interview questions.',
    '3. AI API Call: Calls aiModel.generateContent(prompt) using @google/genai / @google/generative-ai SDK.',
    '4. Regex Sanitizer & Parser: Backend removes markdown ticks (```json) and validates array integrity via JSON.parse().',
    '5. DB Insertion: Inserts a row in interviews table with status = "in_progress", user_id, domain, and questions JSONB, returning the interviewId.'
  ]
);

renderQA(
  6,
  'What is the exact workflow when the candidate submits their interview answers?',
  'Answer submission evaluates 4 distinct rubrics and records the candidate scorecard:',
  [
    '1. Submission: Client sends POST /api/interview/submit with { interviewId, answers } containing speech-to-text transcripts or typed answers.',
    '2. Ownership Verification: Backend confirms the interviewId belongs to req.user.id and is currently "in_progress".',
    '3. AI Rubric Evaluation: Prompts Gemini 1.5 Flash to grade against 4 categories: Domain Knowledge (0-100), Clarity (0-100), Confidence (0-100), and Communication (0-100).',
    '4. Scorecard Validation: Backend ensures all numeric scores are within 0-100 and validates structured feedback arrays.',
    '5. Database Update: Executes UPDATE interviews SET status="completed", overall_score, category_scores, feedback WHERE id=:interviewId.',
    '6. Response: Returns HTTP 200 OK with the final structured scorecard and personalized improvement roadmap.'
  ]
);

// SECTION 4
renderSectionHeader(4, 'Job Application & State Machine Backend Workflow', '6-Stage state engine, duplicate guards, audit trails, and automated notifications');

renderQA(
  7,
  'What happens in the backend when a candidate applies for a job?',
  'The application submission workflow enforces duplicate prevention and snapshot immutability:',
  [
    '1. Duplicate Check: Backend queries applications table for WHERE job_id = :jobId AND user_id = :userId. If exists, returns HTTP 400 "Already applied".',
    '2. Resume Snapshot Binding: Fetches candidate\'s chosen resume and captures an immutable snapshot of the file URL and ATS score at application time.',
    '3. DB Record Creation: Executes INSERT into applications (job_id, user_id, resume_id, status="applied", resume_snapshot).',
    '4. Response: Returns HTTP 201 Created with application tracking ID.'
  ]
);

renderQA(
  8,
  'How does the backend execute an application status transition and notify the candidate?',
  'Status updates follow an atomic, governed transition pipeline:',
  [
    '1. RBAC Guard: requireAdmin middleware validates caller is an authenticated recruiter.',
    '2. State Validation: Verifies target status is valid enum: applied -> reviewed -> shortlisted -> interview_scheduled -> accepted / rejected.',
    '3. Database Update: Executes UPDATE applications SET status = :status, notes = :notes WHERE id = :id.',
    '4. Audit Logging: Inserts an entry into audit_logs table (admin_id, application_id, old_status, new_status, timestamp) for compliance.',
    '5. Asynchronous Notification: Inserts a row into notifications table (user_id=candidateId, title="Status Updated", message) for in-app alert.',
    '6. Response: Returns HTTP 200 OK confirming update and notification dispatch.'
  ]
);

// SECTION 5
renderSectionHeader(5, 'Authentication & RBAC Middleware Execution Flow', 'Bcrypt password hashing, stateless JWT verification, and route guards');

renderQA(
  9,
  'Explain how authenticateToken and requireAdmin work at the code level.',
  'Authentication and authorization are separated into two distinct, composable middlewares:',
  [
    'authenticateToken: Reads req.headers["authorization"], validates "Bearer <token>" format, and calls jwt.verify(token, JWT_SECRET). If valid, attaches { id, email, role } to req.user and calls next(). If expired/invalid, returns HTTP 401.',
    'requireAdmin: Assumes authenticateToken ran first. Checks if req.user.role === "admin". If true, calls next(). If role is "candidate", halts with HTTP 403 Forbidden.'
  ]
);

renderQA(
  10,
  'How are passwords stored and verified securely during login?',
  'Passwords are protected using industry-standard salted cryptographic hashing:',
  [
    'Registration: Plaintext passwords are never stored. The backend runs bcrypt.hash(password, 10) with 10 salt rounds to generate an irreversible 60-character hash.',
    'Login: When a user logs in, the backend retrieves the stored hash by email and executes bcrypt.compare(candidatePassword, storedHash). Upon match, a signed JWT is minted.'
  ]
);

// SECTION 6
renderSectionHeader(6, 'Database Schema & Relational Query Execution', '7 PostgreSQL tables, Supabase SDK, foreign keys, and cascade deletes');

renderQA(
  11,
  'Explain your database schema. How many tables are there and how are they related?',
  'ElevAI uses 7 relational tables in PostgreSQL managed via Supabase:',
  [
    'users: Credentials, email, password hash, role ("candidate" / "admin"), timestamps.',
    'resumes: Resume metadata, Supabase storage URL, extracted text, ATS score, feedback. (FK -> users.id)',
    'interviews: Mock interview sessions, domain, difficulty, questions, answers, category scores, feedback. (FK -> users.id)',
    'jobs: Job postings created by admins (title, company, description, requirements, salary, status). (FK -> users.id)',
    'applications: Bridges candidates and jobs with 6-stage status, resume snapshot, recruiter notes. (FK -> jobs.id, users.id, resumes.id)',
    'notifications: In-app alerts for status updates and interview schedules with read/unread flag. (FK -> users.id)',
    'audit_logs: Immutable log of administrative actions (status changes, job deletion) for accountability. (FK -> users.id)'
  ]
);

renderQA(
  12,
  'Why did you use Supabase Storage instead of saving PDF files directly inside the database as BLOBs?',
  'Database BLOB storage creates severe bottlenecks: it consumes precious database RAM, slows down table scans, and bloats backups. Storing binary files in Supabase S3-compatible Object Storage while keeping only the URL and parsed text in PostgreSQL is the scalable industry standard.'
);

// SECTION 7
renderSectionHeader(7, 'Error Handling, Logging & Fault Tolerance', 'Try-catch strategies, global error middlewares, and AI timeout fallbacks');

renderQA(
  13,
  'How does your backend handle uncaught exceptions and external service outages?',
  'ElevAI implements multi-tiered fault tolerance:',
  [
    'Controller Try-Catch: Every asynchronous route wraps logic in try-catch to prevent unhandled promise rejections.',
    'Global Express Error Handler: At the bottom of the server file, a 4-argument error middleware (err, req, res, next) intercepts unexpected errors and sends clean JSON responses.',
    'AI Outage Fallback: If Gemini API encounters rate limits (HTTP 429) or network timeouts, the backend logs the event and returns a structured fallback message without crashing.'
  ]
);

// SECTION 8
renderSectionHeader(8, 'General & Non-Technical Project Questions', 'Core value proposition, dual workflows, and market differentiation');

renderQA(
  14,
  'What is the core value proposition of ElevAI and what makes it unique?',
  'ElevAI bridges preparation and recruitment into a single closed-loop ecosystem. Candidates practice with real-time AI mock interviews and ATS resume analysis, while recruiters review comprehensive candidate dossiers containing verified AI interview scores alongside resumes before scheduling live interviews.'
);

renderQA(
  15,
  'What are the two primary user workflows in the system?',
  'The application caters to two distinct user journeys:',
  [
    'Candidate Journey: Register -> Take AI Voice Mock Interview -> Upload Resume for ATS Scoring -> Browse Job Marketplace -> Submit Application -> Receive Real-Time Notifications.',
    'Admin/Recruiter Journey: Login as Admin -> Post Jobs -> Open Candidate Review Dossier -> Inspect Resume + AI Interview Scores -> Update Application Status -> Schedule Interview with Meeting Link -> View Platform Analytics.'
  ]
);

// SECTION 9
renderSectionHeader(9, 'Scalability, Edge Cases & "Tricky" Viva Questions', 'Client tampering, scaling to 50k users, cheating prevention, and roadmap');

renderQA(
  16,
  'Can a user modify their role from "candidate" to "admin" in localStorage to hack the system?',
  'No, this is impossible. The backend never trusts client-side storage. The backend cryptographically validates the JWT signature using the secret key (process.env.JWT_SECRET). If a user alters the role in their browser, the cryptographic signature check fails immediately with HTTP 401/403 Invalid Signature.'
);

renderQA(
  17,
  'How would you scale this backend to handle 50,000 concurrent candidates?',
  'We would implement horizontal scaling and asynchronous queues:',
  [
    'Stateless Horizontal Scaling: Deploy multiple Express backend containers behind an NGINX or AWS ALB load balancer.',
    'PgBouncer Connection Pooling: Manage thousands of concurrent PostgreSQL queries without exhausting connection limits.',
    'Redis + BullMQ Background Workers: Offload heavy AI evaluations and PDF parsing to background worker queues so HTTP requests return immediately.',
    'CDN Caching: Cache public job listings on Cloudflare CDN to reduce repetitive database queries.'
  ]
);

renderQA(
  18,
  'What are the current limitations of your project, and what is your future roadmap?',
  'Current limitations include browser-dependent speech recognition and text-based code evaluation. Future roadmap features include: (1) In-browser sandboxed code execution engine (Monaco Editor + Docker microvm), (2) WebRTC video proctoring and emotion analysis, and (3) Multi-round panel interview simulations.'
);

// SECTION 10: RAPID CHEAT SHEET
renderSectionHeader(10, 'Rapid Viva 1-Line Cheat Sheet', 'Quick-fire answers for instant recall during viva defense');

const cheatItems = [
  ['Request Authentication', 'JWT sent in Authorization: Bearer <token>, verified via jwt.verify() in middleware.'],
  ['File Upload Pipeline', 'multer.memoryStorage() buffers PDF in RAM -> pdf-parse extracts text -> buffer uploaded to Supabase Storage.'],
  ['AI JSON Enforcement', 'Zero-shot prompt schema + regex cleaner strips ```json ticks before JSON.parse().'],
  ['SQL Injection Guard', 'Supabase JavaScript client executes parameterized queries natively under the hood.'],
  ['Password Security', 'Salted and hashed using bcryptjs with 10 rounds — plaintext is never stored.'],
  ['In-App Notifications', 'Application state changes insert rows into notifications table, queried by React navbar bell.'],
  ['Application Lifecycle', '6-stage state machine: applied -> reviewed -> shortlisted -> interview_scheduled -> accepted / rejected.'],
  ['AI Model & Tech Stack', 'Google Gemini 1.5 Flash + React 18 (Vite, Tailwind) + Node/Express + Supabase PostgreSQL.']
];

cheatItems.forEach(([q, a]) => {
  checkPage(35);
  const y = doc.y;
  doc.rect(45, y, pageWidth, 24).fillAndStroke(C.cardBg, C.cardBorder);
  doc.fillColor(C.indigo).fontSize(8.5).font('Helvetica-Bold').text(q + ': ', 52, y + 6, { continued: true });
  doc.fillColor(C.bodyText).fontSize(8).font('Helvetica').text(a, { width: pageWidth - 14 });
  doc.y = y + 28;
});

// -------------------------------------------------------------
// FOOTER & PAGE NUMBERING
// -------------------------------------------------------------
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  
  // Top thin accent line
  doc.strokeColor(C.indigo).lineWidth(2).moveTo(45, 15).lineTo(doc.page.width - 45, 15).stroke();
  
  // Footer
  const footerY = doc.page.height - 30;
  doc.strokeColor(C.cardBorder).lineWidth(0.5).moveTo(45, footerY - 8).lineTo(doc.page.width - 45, footerY - 8).stroke();
  
  doc.fillColor(C.mutedText).fontSize(7.5).font('Helvetica')
     .text('ElevAI — Final Viva & Technical Defense Compendium', 45, footerY);

  doc.fillColor(C.mutedText).fontSize(7.5).font('Helvetica-Bold')
     .text(`Page ${i + 1} of ${range.count}`, doc.page.width - 120, footerY, { align: 'right', width: 75 });
}

doc.end();

writeStream.on('finish', () => {
  console.log('[Success] Viva Questionnaire PDF generated at:');
  console.log(outputPath);
});
