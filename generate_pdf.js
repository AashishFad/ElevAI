const fs = require('fs');
const path = require('path');
let PDFDocument;
try {
  PDFDocument = require(path.join(__dirname, 'server', 'node_modules', 'pdfkit', 'js', 'pdfkit.js'));
} catch (e) {
  PDFDocument = require('pdfkit');
}

const outputPath = path.join(__dirname, 'ElevAI_Research_Paper_and_Backend_Workflow.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 45, bottom: 45, left: 45, right: 45 },
  info: {
    Title: 'ElevAI: Autonomous Multimodal AI Platform Research Paper & Backend Architecture',
    Author: 'ElevAI Core Engineering & Research Team',
    Subject: 'AI Career Intelligence, Multi-dimensional ATS Analysis, Speech Analytics & LLM Workflows',
    Keywords: 'AI, LLM, Gemini, ATS Resume, Speech Recognition, Mock Interview, System Architecture',
    CreationDate: new Date(),
  },
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Palette
const COLOR_PRIMARY = '#4338CA'; // Indigo 700
const COLOR_SECONDARY = '#06B6D4'; // Cyan 500
const COLOR_ACCENT = '#8B5CF6'; // Violet 500
const COLOR_TEXT_DARK = '#0F172A'; // Slate 900
const COLOR_TEXT_MUTED = '#475569'; // Slate 600
const COLOR_BG_LIGHT = '#F8FAFC'; // Slate 50
const COLOR_BOX_BORDER = '#CBD5E1'; // Slate 300

function drawHeader(title) {
  doc.save();
  doc.fontSize(8).fillColor(COLOR_TEXT_MUTED);
  doc.text('ELEVAI RESEARCH PAPER & BACKEND WORKFLOW SPECIFICATION', 45, 25, { align: 'left' });
  doc.text('PAGE ' + doc.pageNumber, 45, 25, { align: 'right' });
  doc.moveTo(45, 36).lineTo(550, 36).strokeColor(COLOR_BOX_BORDER).lineWidth(0.5).stroke();
  doc.restore();
}

function drawSectionHeading(number, text) {
  doc.moveDown(0.8);
  doc.save();
  doc.fontSize(13).font('Helvetica-Bold').fillColor(COLOR_PRIMARY);
  doc.text(`${number}. ${text.toUpperCase()}`);
  doc.moveTo(doc.x, doc.y + 2).lineTo(550, doc.y + 2).strokeColor(COLOR_ACCENT).lineWidth(1.5).stroke();
  doc.restore();
  doc.moveDown(0.5);
}

function drawSubHeading(text) {
  doc.moveDown(0.4);
  doc.save();
  doc.fontSize(10.5).font('Helvetica-Bold').fillColor(COLOR_TEXT_DARK);
  doc.text(text);
  doc.restore();
  doc.moveDown(0.2);
}

function drawParagraph(text) {
  doc.save();
  doc.fontSize(9).font('Helvetica').fillColor(COLOR_TEXT_DARK).lineGap(2.5);
  doc.text(text, { align: 'justify' });
  doc.restore();
  doc.moveDown(0.3);
}

function drawBullet(title, description) {
  doc.save();
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(COLOR_PRIMARY).text(`• ${title}: `, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_TEXT_DARK).text(description, { lineGap: 1.5, align: 'justify' });
  doc.restore();
  doc.moveDown(0.2);
}

function drawCodeBox(codeString) {
  const startX = 45;
  const startY = doc.y;
  const boxWidth = 505;
  
  doc.save();
  doc.fontSize(7.5).font('Courier').lineGap(1.5);
  const textHeight = doc.heightOfString(codeString, { width: boxWidth - 16 });
  
  doc.rect(startX, startY, boxWidth, textHeight + 12).fillColor('#0F172A').fill();
  doc.rect(startX, startY, boxWidth, textHeight + 12).strokeColor('#334155').lineWidth(0.5).stroke();
  
  doc.fillColor('#38BDF8').text(codeString, startX + 8, startY + 6, { width: boxWidth - 16 });
  doc.restore();
  doc.y = startY + textHeight + 18;
}

function drawWorkflowBox(title, steps) {
  const startX = 45;
  const startY = doc.y;
  const boxWidth = 505;

  doc.save();
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E293B');
  let innerHeight = 24;
  steps.forEach(s => {
    innerHeight += doc.heightOfString(`Step: ${s}`, { width: boxWidth - 24 }) + 4;
  });

  doc.roundedRect(startX, startY, boxWidth, innerHeight, 6).fillColor('#F1F5F9').fill();
  doc.roundedRect(startX, startY, boxWidth, innerHeight, 6).strokeColor('#CBD5E1').lineWidth(1).stroke();

  doc.fillColor(COLOR_PRIMARY).text(`Workflow: ${title}`, startX + 10, startY + 8);
  doc.moveTo(startX + 10, startY + 20).lineTo(startX + boxWidth - 10, startY + 20).strokeColor('#E2E8F0').lineWidth(0.5).stroke();

  let curY = startY + 26;
  steps.forEach((step, idx) => {
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR_ACCENT).text(`[Step ${idx + 1}] `, startX + 12, curY, { continued: true });
    doc.font('Helvetica').fillColor(COLOR_TEXT_DARK).text(step, { width: boxWidth - 30 });
    curY += doc.heightOfString(`[Step ${idx + 1}] ` + step, { width: boxWidth - 30 }) + 3;
  });

  doc.restore();
  doc.y = startY + innerHeight + 10;
}

// ==========================================
// COVER / TITLE SECTION
// ==========================================
doc.save();
// Background Banner
doc.rect(45, 45, 505, 110).fillColor('#070714').fill();
doc.rect(45, 45, 505, 110).strokeColor('#1E1B4B').lineWidth(1).stroke();

doc.fontSize(16).font('Helvetica-Bold').fillColor('#FFFFFF').text('ElevAI: Autonomous Multimodal AI Platform for', 60, 60);
doc.fontSize(14).font('Helvetica-Bold').fillColor('#38BDF8').text('Multi-Dimensional Resume Optimization, Skill-Gap Diagnostics,', 60, 80);
doc.fontSize(14).font('Helvetica-Bold').fillColor('#A855F7').text('& Real-Time Voice Interview Simulations', 60, 98);

doc.fontSize(8).font('Helvetica').fillColor('#94A3B8').text('Technical Research Paper & Full-Stack Backend Architecture Specification | Version 1.0 (2026)', 60, 124);
doc.restore();

doc.y = 170;

// Abstract Box
doc.save();
doc.roundedRect(45, doc.y, 505, 105, 4).fillColor('#F8FAFC').fill();
doc.roundedRect(45, doc.y, 505, 105, 4).strokeColor('#E2E8F0').lineWidth(1).stroke();

doc.fontSize(9.5).font('Helvetica-Bold').fillColor(COLOR_PRIMARY).text('ABSTRACT', 55, doc.y + 8);
doc.fontSize(8).font('Helvetica').fillColor(COLOR_TEXT_DARK).lineGap(1.8).text(
  'Contemporary technical recruitment suffers from severe informational asymmetry. Conventional Application Tracking Systems (ATS) enforce brittle keyword-matching algorithms that reject qualified talent and encourage deceptive keyword stuffing. Furthermore, applicants lack systematic feedback loops to evaluate verbal fluency and role readiness. This paper presents ElevAI, an integrated multimodal AI career ecosystem powered by Node.js, Express, PostgreSQL, Prisma, Web Speech API, and Gemini 3.5 Flash. We articulate the theoretical algorithms, scoring formulations, schema architecture, and fault-tolerant distributed workflows governing all 10 platform modules.',
  55, doc.y + 2, { width: 485, align: 'justify' }
);
doc.restore();

doc.y = 285;

// SECTION 1
drawSectionHeading('1', 'Introduction & Problem Statement');
drawParagraph('The modern hiring market requires candidates to simultaneously master algorithmic problem-solving, structural ATS keyword alignment, and synchronous verbal articulation. Candidates face three key technical hurdles:');
drawBullet('Syntactic Blind Spots', 'Legacy ATS parsers fail to associate semantically equivalent engineering terms (e.g., Redis caching vs. In-memory Key-Value stores).');
drawBullet('Factual Hallucination Risks', 'Commercial generative resume rewriters routinely fabricate degrees, unworked tenure, or metrics, invalidating candidate authenticity.');
drawBullet('Acoustic Preparedness Gap', 'Written resume readiness does not equate to interview fluency. Candidates lack objective telemetry regarding speech rate (WPM), hesitation markers, and answer relevance.');

// SECTION 2
drawSectionHeading('2', 'High-Level System Architecture');
drawParagraph('ElevAI is implemented as a 4-tier reactive architecture characterized by stateless API gateways, relational persistence guarantees, and streaming client telemetry:');

const archDiagram = 
`+-----------------------------------------------------------------------------+
| CLIENT TIER: React 18 SPA | Tailwind Glassmorphic Engine | Web Speech API   |
+-------------------------------------+---------------------------------------+
                                      | HTTP REST / JSON / Multipart
+-------------------------------------v---------------------------------------+
| API GATEWAY: Express 4.x | JWT Auth Guard | Multer In-Memory Stream Buffer  |
+-------------------+-------------------------------------+-------------------+
                    |                                     |
+-------------------v-------------------+   +-------------v-------------------+
| APPLICATION SERVICE LAYER             |   | PERSISTENCE TIER: PostgreSQL    |
| - Resume Parsing & Multi-Dim Engine   |   | Prisma ORM 6.x Relational Model |
| - XYZ Bullet Refactor Engine          |   | Cascading Integrity & Indexes   |
| - Job Optimization Semantic Matcher   |   +---------------------------------+
| - Skill Gap Universe Taxonomy         |
| - Real-Time Voice Interview Evaluator |
| - ATS Schema Resume Builder           |
+-------------------+-------------------+
                    |
+-------------------v---------------------------------------------------------+
| AI ENGINE: Google Gemini 3.5 Flash | JSON Schema Validation | Retry Protocol|
+-----------------------------------------------------------------------------+`;
drawCodeBox(archDiagram);

// ==========================================
// PAGE 2: CORE MODULES 1 - 4
// ==========================================
doc.addPage();
drawHeader();

drawSectionHeading('3', 'Module Workflows & Mathematical Formulations');

drawSubHeading('3.1 User Authentication & Career Goal Calibration');
drawParagraph('All platform operations are anchored to a CareerGoal tuple (R_target, L_exp) specifying the candidate target role and experience tier (Fresher, 1-2 Yrs, 3-5 Yrs, Experienced). This context vector conditions all downstream prompt templates to prevent seniority mismatch.');
drawWorkflowBox('Career Goal Context Calibration', [
  'Client submits JWT Bearer token + { targetRole, experienceLevel } to POST /api/career-goal.',
  'Express controller validates schema, hashes payload context, and performs upsert on CareerGoal model.',
  'PostgreSQL associates CareerGoal with User ID via foreign key relation.',
  'Subsequent AI prompt invocations inject (R_target, L_exp) into system instructions.'
]);

drawSubHeading('3.2 Document Ingestion & Multi-Dimensional ATS Resume Analyzer');
drawParagraph('The ATS diagnostic pipeline evaluates uploaded documents across five orthogonal dimensions. Text is extracted in-memory via pdf-parse or mammoth and synthesized via Gemini 3.5 Flash.');
drawBullet('Mathematical Scoring Matrix', 'OverallScore = 0.25*(Impact) + 0.20*(ATS Keywords) + 0.20*(Structure) + 0.20*(Relevance) + 0.15*(Readability).');
drawWorkflowBox('Resume Analysis Pipeline', [
  'Multipart file uploaded to POST /api/resumes/upload; Multer writes buffer to memory.',
  'Buffer parsed by file type (PDF stream or DOCX OpenXML) to generate raw text string.',
  'POST /api/resumes/:id/analyze constructs Gemini payload with active CareerGoal constraints.',
  'Gemini returns structured JSON: { overallScore, scoreBreakdown, strengths, weaknesses, actionItems }.',
  'Prisma creates ResumeAnalysis record; Notification service queues in-app alert.'
]);

drawSubHeading('3.3 Factual Safety Resume Bullet Improver (STAR/XYZ Engine)');
drawParagraph('To guarantee 0% hallucination, ElevAI enforces Google-style XYZ formulation ("Accomplished X by doing Y as measured by Z") strictly preserving factual experiences while elevating grammatical force.');
drawWorkflowBox('Bullet Improvement Flow', [
  'Client calls POST /api/resumes/:id/improve targeting an analyzed resume.',
  'Service segments resume into discrete Project and Experience bullet arrays.',
  'Gemini analyzes each bullet, identifies structural weaknesses, and provides high-impact rewrite with metric placeholders.',
  'Prisma persists ResumeImprovement record with original versus improved diffs.'
]);

drawSubHeading('3.4 Job-Specific Resume Optimization & Semantic Matching');
drawParagraph('Calculates direct requirement coverage between candidate resume T_resume and target Job Description T_JD.');
drawBullet('Set-Theoretic Match Formulation', 'MatchScore = 0.50*(|C_resume ∩ M_hard| / |M_hard|) + 0.30*(|C_resume ∩ P_qual| / |P_qual|) + 0.20*(SemanticSim).');
drawWorkflowBox('Job Optimization Flow', [
  'Client submits { resumeId, jobDescription, companyName, jobTitle } to POST /api/job-optimization/analyze.',
  'Gemini extracts hard skills, soft skills, and qualifications from the JD.',
  'Cross-references extracted candidate skills to compute matching, missing, and partial skill arrays.',
  'Generates tailored section recommendations and saves JobOptimization record.'
]);

// ==========================================
// PAGE 3: CORE MODULES 5 - 8
// ==========================================
doc.addPage();
drawHeader();

drawSubHeading('3.5 Skill Gap Universe & Adaptive Learning Roadmaps');
drawParagraph('Evaluates candidate market readiness by comparing verified resume competencies against standard industry role taxonomies.');
drawWorkflowBox('Skill Gap Analysis Flow', [
  'POST /api/skill-gap/analyze triggered with optional resumeId and jobOptimizationId.',
  'AI generates readiness score (0-100), existing skill taxonomy, and missing priority gaps.',
  'Constructs milestone-based learning roadmap with concrete project ideas and verification criteria.',
  'Saves SkillGapAnalysis record in PostgreSQL with relational linking to active CareerGoal.'
]);

drawSubHeading('3.6 Multimodal AI & Voice Mock Interview Simulator');
drawParagraph('A complete interactive simulation engine combining Web Speech API voice capture, acoustic telemetry computation, and dynamic LLM multi-criteria answer evaluation.');
drawBullet('Acoustic Speech Telemetry', 'Speaking Rate (WPM) = (WordCount / DurationSec) * 60; Filler Words tracked via regex token matching.');
drawBullet('Multi-Criteria Rubric', 'AnswerScore = 0.40*(Technical) + 0.35*(Relevance) + 0.25*(Communication).');

const interviewFlow = 
`[Candidate Config: Type, Level, Count, Voice/Text]
                     |
                     v
       POST /api/mock-interview/start
                     |
                     v
[Gemini Generates Q_1 ... Q_n Tailored to Role]
                     |
                     v
   +---> [Question Presented & Vocalized via TTS]
   |                 |
   |     Candidate Speaks / Types Response
   |                 |
   |                 v
   |      POST /api/mock-interview/:id/answer
   |     (Includes text, WPM, duration, fillers)
   |                 |
   |                 v
   |     [Gemini Rubric Evaluation Engine]
   |     - Technical (0-10), Relevance (0-10)
   |     - Communication (0-10), Feedback
   |     - Strengths, Weaknesses, Ideal Answer
   |                 |
   |                 v
   +-----(More Questions)---- (Finished: Aggregate Overall 0-100 Score)`;
drawCodeBox(interviewFlow);

drawSubHeading('3.7 Schema-Enforced ATS Resume Builder');
drawParagraph('Allows candidates to construct, reorder, and export ATS-friendly resumes backed by a strict JSON schema and inline AI writing assistance.');
drawWorkflowBox('Resume Builder Operations', [
  'POST /api/resume-builder/docs initializes new document with customized sectionOrder array.',
  'PUT /api/resume-builder/docs/:id updates structured fields (experience, projects, skills).',
  'POST /api/resume-builder/ai-improve refactors individual summaries or bullet points.',
  'Client-side PDF compiler formats document into single-column ATS printable page.'
]);

drawSubHeading('3.8 Smart Notification & Asynchronous Dispatcher');
drawParagraph('A central event broker that creates notification records upon completion of AI jobs, strictly respecting candidate notification preferences.');
drawWorkflowBox('Notification Broker Flow', [
  'AI analysis service finishes background job (e.g., resume analysis, mock interview).',
  'NotificationService checks NotificationPreference flags (resumeEnabled, interviewEnabled, etc.).',
  'If enabled, creates Notification record; client Navbar badge pulses and displays alert.'
]);

// ==========================================
// PAGE 4: DATABASE, FAULT TOLERANCE & API CATALOG
// ==========================================
doc.addPage();
drawHeader();

drawSectionHeading('4', 'Fault Tolerance & Resilience Protocols');
drawParagraph('ElevAI implements industrial-grade error recovery to ensure continuous uptime during LLM rate limits (HTTP 429) or transient network timeouts:');
drawBullet('Exponential Backoff', 'All Gemini calls execute inside a retry loop (3 attempts with backoff intervals of 7s and 15s).');
drawBullet('Deterministic Fallbacks', 'If remote LLM endpoints become unreachable, the service activates rule-based heuristic fallback parsers that return syntactically valid JSON structures.');
drawBullet('JSON Sanitization', 'Markdown triple-backtick artifacts and trailing commas are stripped automatically before JSON parsing.');

drawSectionHeading('5', 'Database Schema & Relational Specifications');
drawParagraph('The database schema comprises 10 interconnected models ensuring complete relational integrity:');

const dbCatalog = 
`+-----------------------+-----------------------------------------------------+
| MODEL NAME            | PRIMARY RESPONSIBILITIES                            |
+-----------------------+-----------------------------------------------------+
| User                  | Credentials (bcrypt), JWT, Role (USER, ADMIN)       |
| CareerGoal            | Target role & seniority calibration context         |
| Resume                | Document metadata, storage path, raw extracted text |
| ResumeAnalysis        | 5-dimensional ATS scores, feedback, action items    |
| ResumeImprovement     | Original vs improved bullet diffs (XYZ formula)     |
| JobOptimization       | Match score, matching/missing skills, JD advice     |
| SkillGapAnalysis      | Readiness score, gap taxonomy, learning milestones  |
| InterviewSession      | Live session state, aggregate scores, settings      |
| InterviewQuestion     | Sequenced questions, categories, expected topics    |
| InterviewAnswer       | Speech telemetry (WPM, fillers), rubric scores      |
| ResumeBuilderDocument | JSON schema resume state, custom section ordering   |
| Notification          | Event stream records, read/unread state             |
| NotificationPreference| User-controlled notification channel toggles        |
+-----------------------+-----------------------------------------------------+`;
drawCodeBox(dbCatalog);

drawSectionHeading('6', 'API Endpoint Specifications Catalog');
const apiCatalog = 
`+--------+------------------------------------+-------------------------------+
| METHOD | ROUTE                              | PURPOSE                       |
+--------+------------------------------------+-------------------------------+
| POST   | /api/auth/register, /login         | Authentication & JWT issuance |
| GET    | /api/career-goal (POST to set)     | Career benchmark management   |
| POST   | /api/resumes/upload                | Multipart PDF/DOCX ingestion  |
| POST   | /api/resumes/:id/analyze           | Multi-dimensional ATS scoring |
| POST   | /api/resumes/:id/improve           | Action bullet point enhancer  |
| POST   | /api/job-optimization/analyze      | Job match & keyword analysis  |
| POST   | /api/skill-gap/analyze             | Skill gap & roadmap engine    |
| POST   | /api/mock-interview/start          | Interactive interview init    |
| POST   | /api/mock-interview/:id/answer     | Speech & answer evaluation    |
| GET    | /api/mock-interview/:id/result     | Complete performance report   |
| GET    | /api/resume-builder/docs           | Custom builder documents      |
| POST   | /api/resume-builder/ai-improve     | Inline generative writing     |
| GET    | /api/notifications (PUT for prefs) | Notification stream & toggles |
+--------+------------------------------------+-------------------------------+`;
drawCodeBox(apiCatalog);

drawSectionHeading('7', 'Conclusion');
drawParagraph('ElevAI establishes a robust paradigm for automated career acceleration by integrating multi-dimensional ATS resume evaluation, factual bullet optimization, role-specific skill gap diagnostics, and low-latency voice interview simulation into a unified full-stack architecture.');

doc.moveDown(0.5);
doc.save();
doc.fontSize(8).font('Helvetica-Oblique').fillColor(COLOR_TEXT_MUTED).text('ElevAI Research Paper & Architecture Specification © 2026. All rights reserved.', { align: 'center' });
doc.restore();

doc.end();

writeStream.on('finish', () => {
  console.log('PDF generated successfully at: ' + outputPath);
});
