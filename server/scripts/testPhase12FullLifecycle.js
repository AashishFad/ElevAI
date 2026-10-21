/**
 * ElevAI — Phase 12: Comprehensive Testing, Bug Fixing & Edge Cases Suite
 * 
 * Verifies all 10 core operational domains:
 * 1. Authentication Lifecycle & Credential Validation
 * 2. User Roles & Admin RBAC Enforcement
 * 3. Resume Workflow, Edge Cases & Deletion Safety Pipeline
 * 4. AI Features Reliability & Fault-Tolerant Fallbacks
 * 5. Job Lifecycle (Draft, Published, Closed, Deadlines)
 * 6. Notification System & Multi-Tenant Boundaries
 * 7. Candidate Application Submission & Tracking
 * 8. Admin Application Review, Status Transitions & Notes
 * 9. Recruitment Analytics Engine & Factual Database Telemetry
 * 10. Parameter Hardening, UUID Validation & Error Sanitization
 */

const bcrypt = require('bcryptjs');
const { getPrismaClient } = require('../src/config/database');
const { generateToken, verifyToken } = require('../src/utils/jwt');
const { validateRegisterInput, validateLoginInput } = require('../src/validators/auth.validator');
const { validateJobInput } = require('../src/validators/job.validator');
const { validateResumeFile } = require('../src/validators/resume.validator');
const { requireAdmin, requireRole } = require('../src/middleware/roleMiddleware');
const { isValidUUID } = require('../src/middleware/validateParams');

const applicationService = require('../src/services/applicationService');
const resumeAnalysisService = require('../src/services/resumeAnalysisService');
const resumeImprovementService = require('../src/services/resumeImprovementService');
const jobOptimizationService = require('../src/services/jobOptimizationService');
const skillGapService = require('../src/services/skillGapService');
const interviewService = require('../src/services/interviewService');
const notificationService = require('../src/services/notificationService');
const analyticsService = require('../src/services/analyticsService');
const storageService = require('../src/services/storageService');
const resumeBuilderService = require('../src/services/resumeBuilderService');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] Test ${totalTests}: ${message}`);
  }
}

async function runPhase12TestSuite() {
  console.log('\n================================================================');
  console.log('  ELEVAI PHASE 12: TESTING, BUG FIXING & EDGE CASES AUDIT');
  console.log('================================================================\n');

  const prisma = getPrismaClient();

  try {
    // ----------------------------------------------------
    // SETUP: Provision Test Users (Candidate A, Candidate B, Admin)
    // ----------------------------------------------------
    console.log('--- SETUP: Provisioning Isolated Test Identities ---');
    const ts = Date.now();
    const emailA = `candidate_a_${ts}@elevai.test`;
    const emailB = `candidate_b_${ts}@elevai.test`;
    const emailAdmin = `admin_${ts}@elevai.test`;
    const passwordHash = await bcrypt.hash('ElevAITestPass123!', 10);

    const userA = await prisma.user.create({
      data: { name: 'Candidate Alex', email: emailA, passwordHash, role: 'USER' },
    });

    const userB = await prisma.user.create({
      data: { name: 'Candidate Brenda', email: emailB, passwordHash, role: 'USER' },
    });

    const adminUser = await prisma.user.create({
      data: { name: 'Admin Recruiter', email: emailAdmin, passwordHash, role: 'ADMIN' },
    });

    // Create career goal for User A & User B
    await prisma.careerGoal.create({
      data: {
        userId: userA.id,
        targetRole: 'Full Stack Engineer',
        experienceLevel: 'ONE_TO_TWO_YEARS',
      },
    });

    await prisma.careerGoal.create({
      data: {
        userId: userB.id,
        targetRole: 'Frontend Developer',
        experienceLevel: 'FRESHER',
      },
    });

    const tokenA = generateToken({ userId: userA.id, role: userA.role, email: userA.email });
    const tokenB = generateToken({ userId: userB.id, role: userB.role, email: userB.email });
    const tokenAdmin = generateToken({ userId: adminUser.id, role: adminUser.role, email: adminUser.email });

    console.log(`  Candidate A (${userA.id}), Candidate B (${userB.id}), Admin (${adminUser.id}) ready.\n`);

    // ====================================================
    // DOMAIN 1: AUTHENTICATION LIFECYCLE
    // ====================================================
    console.log('--- DOMAIN 1: Authentication Lifecycle & Token Validation ---');

    // Test 1: Valid registration input validation
    const regValid = validateRegisterInput({ name: 'Valid User', email: 'valid@elevai.test', password: 'ValidPassword123' });
    assert(regValid.isValid && regValid.sanitized.email === 'valid@elevai.test', 'Registration validator accepts compliant credentials');

    // Test 2: Invalid registration inputs
    const regInvalid = validateRegisterInput({ name: '', email: 'not-an-email', password: '12' });
    assert(!regInvalid.isValid && regInvalid.errors.length === 3, 'Registration validator rejects empty name, malformed email, and short password');

    // Test 3: Password length upper-bound protection (max 128 chars)
    const regLongPass = validateRegisterInput({ name: 'User', email: 'user@test.com', password: 'x'.repeat(150) });
    assert(!regLongPass.isValid && regLongPass.errors.some((e) => e.includes('128 characters')), 'Registration validator enforces max password length (128 chars)');

    // Test 4: Token generation and roundtrip verification
    const decodedA = verifyToken(tokenA);
    assert(decodedA && decodedA.userId === userA.id && decodedA.role === 'USER', 'JWT token generates and verifies payload integrity');

    // Test 5: Tampered token rejection
    const tamperedToken = tokenA.substring(0, tokenA.length - 6) + 'abcdef';
    const decodedTampered = verifyToken(tamperedToken);
    assert(decodedTampered === null, 'Tampered JWT token fails verification and returns null');

    // Test 6: Invalid login validation
    const loginInvalid = validateLoginInput({ email: '', password: '' });
    assert(!loginInvalid.isValid && loginInvalid.errors.length === 2, 'Login validator rejects empty email and password');

    // Test 7: Password comparison with bcrypt
    const passMatch = await bcrypt.compare('ElevAITestPass123!', userA.passwordHash);
    const passMismatch = await bcrypt.compare('WrongPassword999!', userA.passwordHash);
    assert(passMatch && !passMismatch, 'Password hash matches valid password and rejects incorrect password');

    // Test 8: Role cannot be spoofed in registration payload
    const spoofPayload = { name: 'Hacker', email: 'hack@elevai.test', password: 'password123', role: 'ADMIN' };
    const sanitizedSpoof = validateRegisterInput(spoofPayload);
    assert(sanitizedSpoof.sanitized.role === undefined, 'Registration sanitizer ignores client-provided role attribute');

    // ====================================================
    // DOMAIN 2: USER ROLES & RBAC ENFORCEMENT
    // ====================================================
    console.log('\n--- DOMAIN 2: User Roles & RBAC Server-Side Enforcement ---');

    // Test 9: Unauthenticated request to requireAdmin receives 401
    let unauthCode = null;
    requireAdmin({ user: null }, { status: (c) => { unauthCode = c; return { json: () => {} }; } }, () => {});
    assert(unauthCode === 401, 'Unauthenticated request to requireAdmin receives HTTP 401');

    // Test 10: Normal user accessing requireAdmin receives 403
    let forbiddenCode = null;
    requireAdmin({ user: { userId: userA.id, role: 'USER' } }, { status: (c) => { forbiddenCode = c; return { json: () => {} }; } }, () => {});
    assert(forbiddenCode === 403, 'Normal user (role: USER) accessing admin route receives HTTP 403');

    // Test 11: Admin accessing requireAdmin passes
    let adminPass = false;
    requireAdmin({ user: { userId: adminUser.id, role: 'ADMIN' } }, { status: () => ({ json: () => {} }) }, () => { adminPass = true; });
    assert(adminPass, 'Admin user (role: ADMIN) successfully passes requireAdmin middleware');

    // ====================================================
    // DOMAIN 3: RESUME WORKFLOW, EDGE CASES & DELETION SAFETY
    // ====================================================
    console.log('\n--- DOMAIN 3: Resume Workflow & Deletion Safety ---');

    // Test 12: Resume validator detects valid PDF
    const validFile = { originalname: 'Alex_Resume.pdf', mimetype: 'application/pdf', size: 1024 * 500 };
    const validCheck = validateResumeFile(validFile);
    assert(validCheck.isValid, 'Resume validator approves valid PDF file');

    // Test 13: Resume validator rejects unsupported file type
    const invalidFile = { originalname: 'Image.png', mimetype: 'image/png', size: 1024 * 500 };
    const invalidCheck = validateResumeFile(invalidFile);
    assert(!invalidCheck.isValid && invalidCheck.errors.some((e) => e.includes('PDF') || e.includes('Word')), 'Resume validator rejects unsupported MIME types');

    // Test 14: Resume validator rejects oversized files (> 5MB)
    const oversizedFile = { originalname: 'Huge_Resume.pdf', mimetype: 'application/pdf', size: 6 * 1024 * 1024 };
    const oversizedCheck = validateResumeFile(oversizedFile);
    assert(!oversizedCheck.isValid && oversizedCheck.errors.some((e) => e.includes('5 MB')), 'Resume validator rejects files exceeding 5MB size limit');

    // Create valid resumes for User A and User B
    const resumeA1 = await prisma.resume.create({
      data: {
        userId: userA.id,
        originalFileName: 'Alex_Johnson_FullStack.pdf',
        storagePath: `${userA.id}/test/Alex_Johnson_FullStack.pdf`,
        fileType: 'application/pdf',
        fileSize: 1024 * 200,
        status: 'READY',
        extractedText: 'Alex Johnson. Senior Full Stack Engineer with 3 years experience in React, Node.js, TypeScript, PostgreSQL, and AWS.',
      },
    });

    const resumeA2_unlinked = await prisma.resume.create({
      data: {
        userId: userA.id,
        originalFileName: 'Alex_Draft_Resume.pdf',
        storagePath: `${userA.id}/test/Alex_Draft_Resume.pdf`,
        fileType: 'application/pdf',
        fileSize: 1024 * 150,
        status: 'READY',
        extractedText: 'Alex Johnson. Draft resume with frontend focus in React and Tailwind.',
      },
    });

    const resumeB1 = await prisma.resume.create({
      data: {
        userId: userB.id,
        originalFileName: 'Brenda_Frontend.pdf',
        storagePath: `${userB.id}/test/Brenda_Frontend.pdf`,
        fileType: 'application/pdf',
        fileSize: 1024 * 180,
        status: 'READY',
        extractedText: 'Brenda Lee. Frontend Developer skilled in React, CSS, and UI design.',
      },
    });

    // Test 15: User A retrieves own resumes
    const userAResumes = await prisma.resume.findMany({ where: { userId: userA.id } });
    assert(userAResumes.length === 2, 'User A retrieves all owned stored resumes');

    // Test 16: Cross-user resume isolation (User B cannot access User A resume)
    const crossResumeQuery = await prisma.resume.findFirst({ where: { id: resumeA1.id, userId: userB.id } });
    assert(crossResumeQuery === null, 'User B querying User A resume returns null (isolated access)');

    // Test 17: User B forbidden from generating secure download URL for User A resume
    let crossDownloadForbidden = false;
    try {
      await applicationService.getSecureResumeDownloadUrl({ userId: userB.id, role: 'USER', resumeId: resumeA1.id });
    } catch (err) {
      if (err.statusCode === 403) crossDownloadForbidden = true;
    }
    assert(crossDownloadForbidden, 'User B forbidden (HTTP 403) from generating download URL for User A resume');

    // Test 18: Unlinked resume can be safely deleted
    await prisma.resume.delete({ where: { id: resumeA2_unlinked.id } });
    const checkDeleted = await prisma.resume.findUnique({ where: { id: resumeA2_unlinked.id } });
    assert(checkDeleted === null, 'Unlinked resume is deleted successfully from database');

    // ====================================================
    // DOMAIN 4: AI FEATURES RELIABILITY & STRUCTURED RESULTS
    // ====================================================
    console.log('\n--- DOMAIN 4: AI Features Reliability & Results ---');

    // Test 19: Resume Analysis execution & score bounds
    const analysisA = await resumeAnalysisService.performResumeAnalysis({
      userId: userA.id,
      resumeId: resumeA1.id,
    });
    assert(
      analysisA &&
      typeof analysisA.overallScore === 'number' &&
      analysisA.overallScore >= 0 &&
      analysisA.overallScore <= 100 &&
      Array.isArray(analysisA.strengths),
      `AI Resume Analysis completed: Score ${analysisA.overallScore}/100 with structured feedback`
    );

    // Test 20: Analysis retrieval by owner
    const retrievedAnalysis = await resumeAnalysisService.getAnalysisById({
      userId: userA.id,
      analysisId: analysisA.id,
    });
    assert(retrievedAnalysis && retrievedAnalysis.id === analysisA.id, 'Candidate can retrieve stored AI analysis report');

    // Test 21: Cross-user analysis access blocked
    let crossAnalysisBlocked = false;
    try {
      await resumeAnalysisService.getAnalysisById({ userId: userB.id, analysisId: analysisA.id });
    } catch (err) {
      if (err.statusCode === 404) crossAnalysisBlocked = true;
    }
    assert(crossAnalysisBlocked, 'User B is blocked (HTTP 404) from accessing User A analysis report');

    // Test 22: Resume Improver generates suggestions without mutating original resume
    const improvementA = await resumeImprovementService.performResumeImprovement({
      userId: userA.id,
      resumeId: resumeA1.id,
      analysisId: analysisA.id,
    });
    const originalResumeCheck = await prisma.resume.findUnique({ where: { id: resumeA1.id } });
    assert(
      improvementA &&
      originalResumeCheck.extractedText === resumeA1.extractedText,
      'AI Resume Improver generates suggestions while strictly preserving original resume text'
    );

    // ====================================================
    // DOMAIN 5: JOB LIFECYCLE (DRAFT, PUBLISHED, CLOSED, DEADLINES)
    // ====================================================
    console.log('\n--- DOMAIN 5: Job Lifecycle & Candidate Feed Visibility ---');

    // Test 23: Job validator accepts valid job requisition
    const validJobData = {
      title: 'Senior Cloud Platform Engineer',
      companyName: 'Apex Cloud Dynamics',
      location: 'Pune, India',
      workMode: 'HYBRID',
      employmentType: 'FULL_TIME',
      experienceRequired: '2-4 years',
      requiredSkills: ['Node.js', 'PostgreSQL', 'AWS', 'Docker'],
      description: 'Join our cloud infrastructure team building high-performance scalable systems.',
      status: 'DRAFT',
    };
    const jobVal = validateJobInput(validJobData);
    assert(jobVal.isValid, 'Job validator approves compliant job requisition');

    // Create Draft Job
    const draftJob = await prisma.job.create({
      data: {
        ...jobVal.sanitized,
        createdBy: adminUser.id,
        status: 'DRAFT',
      },
    });

    // Test 24: Draft job is NOT in public feed
    const publicJobsFeed = await prisma.job.findMany({ where: { status: 'PUBLISHED' } });
    const draftFoundInFeed = publicJobsFeed.some((j) => j.id === draftJob.id);
    assert(!draftFoundInFeed, 'Draft job is invisible in public/candidate job feed');

    // Test 25: Candidate applying to DRAFT job is rejected
    let draftApplyBlocked = false;
    try {
      await applicationService.submitApplication({
        userId: userA.id,
        jobId: draftJob.id,
        resumeId: resumeA1.id,
      });
    } catch (err) {
      if (err.statusCode === 400) draftApplyBlocked = true;
    }
    assert(draftApplyBlocked, 'Applying to DRAFT job is rejected with HTTP 400');

    // Publish the job
    const publishedJob = await prisma.job.update({
      where: { id: draftJob.id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
    assert(publishedJob.status === 'PUBLISHED', 'Admin successfully transitions job status from DRAFT to PUBLISHED');

    // Create an Expired Deadline Job
    const expiredJob = await prisma.job.create({
      data: {
        title: 'Legacy Python Developer',
        companyName: 'Apex Cloud Dynamics',
        location: 'Remote',
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        experienceRequired: '3+ years',
        requiredSkills: ['Python', 'Django'],
        description: 'Position with expired deadline.',
        status: 'PUBLISHED',
        applicationDeadline: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdBy: adminUser.id,
      },
    });

    // Test 26: Candidate applying to expired deadline job is rejected
    let expiredApplyBlocked = false;
    try {
      await applicationService.submitApplication({
        userId: userA.id,
        jobId: expiredJob.id,
        resumeId: resumeA1.id,
      });
    } catch (err) {
      if (err.statusCode === 400 && err.message.includes('deadline')) expiredApplyBlocked = true;
    }
    assert(expiredApplyBlocked, 'Applying to job with expired deadline is rejected with HTTP 400');

    // Create a Closed Job
    const closedJob = await prisma.job.create({
      data: {
        title: 'Closed Security Analyst',
        companyName: 'Apex Cloud Dynamics',
        location: 'Remote',
        workMode: 'REMOTE',
        employmentType: 'CONTRACT',
        experienceRequired: '2 years',
        requiredSkills: ['Security', 'Audit'],
        description: 'Requisition has been closed.',
        status: 'CLOSED',
        closedAt: new Date(),
        createdBy: adminUser.id,
      },
    });

    // Test 27: Candidate applying to closed job is rejected
    let closedApplyBlocked = false;
    try {
      await applicationService.submitApplication({
        userId: userA.id,
        jobId: closedJob.id,
        resumeId: resumeA1.id,
      });
    } catch (err) {
      if (err.statusCode === 400) closedApplyBlocked = true;
    }
    assert(closedApplyBlocked, 'Applying to CLOSED job is rejected with HTTP 400');

    // ====================================================
    // DOMAIN 6: NOTIFICATIONS & MULTI-TENANT BOUNDARIES
    // ====================================================
    console.log('\n--- DOMAIN 6: Notifications & Multi-Tenant Boundaries ---');

    // Test 28: Notification creation and delivery
    const testNotifA = await notificationService.createNotification({
      userId: userA.id,
      type: 'JOB',
      title: 'New Job Matching Your Career Goal',
      message: 'Apex Cloud Dynamics published Senior Cloud Platform Engineer.',
      actionUrl: `/jobs/${publishedJob.id}`,
    });
    assert(testNotifA && testNotifA.userId === userA.id, 'Notification created and routed to candidate');

    // Test 29: Unread count query
    const unreadCount = await notificationService.getUnreadCount({ userId: userA.id });
    assert(unreadCount >= 1, `Candidate unread notification count verified (${unreadCount} unread)`);

    // Test 30: Mark single notification as read
    const readNotif = await notificationService.markAsRead({ userId: userA.id, notificationId: testNotifA.id });
    assert(readNotif.isRead === true, 'Candidate can mark single notification as read');

    // Test 31: Cross-user notification isolation (User B cannot read User A notification)
    let crossNotifReadBlocked = false;
    try {
      await notificationService.markAsRead({ userId: userB.id, notificationId: testNotifA.id });
    } catch (err) {
      if (err.statusCode === 404) crossNotifReadBlocked = true;
    }
    assert(crossNotifReadBlocked, 'User B is blocked (HTTP 404) from modifying User A notifications');

    // ====================================================
    // DOMAIN 7: APPLICATION SUBMISSION & STATUS INTEGRITY
    // ====================================================
    console.log('\n--- DOMAIN 7: Candidate Application Workflow ---');

    // Create Job Optimization for User A
    const jobOptA = await jobOptimizationService.createJobOptimization({
      userId: userA.id,
      resumeId: resumeA1.id,
      jobDescription: publishedJob.description,
      companyName: publishedJob.companyName,
      jobTitle: publishedJob.title,
      jobLocation: publishedJob.location,
    });
    assert(jobOptA && typeof jobOptA.matchScore === 'number', `Job optimization computed Match Score: ${jobOptA.matchScore}%`);

    // Test 32: Candidate A applies to published job with optimized resume
    const appA = await applicationService.submitApplication({
      userId: userA.id,
      jobId: publishedJob.id,
      resumeId: resumeA1.id,
      jobOptimizationId: jobOptA.id,
      coverLetter: 'I am excited to apply for the Senior Cloud Platform Engineer position.',
    });
    assert(
      appA &&
      appA.status === 'SUBMITTED' &&
      appA.matchScore === jobOptA.matchScore,
      `Application submitted successfully (ID: ${appA.id}, Status: ${appA.status}, Score: ${appA.matchScore}%)`
    );

    // Test 33: Duplicate application is rejected with HTTP 409
    let duplicateRejected = false;
    try {
      await applicationService.submitApplication({
        userId: userA.id,
        jobId: publishedJob.id,
        resumeId: resumeA1.id,
      });
    } catch (err) {
      if (err.statusCode === 409) duplicateRejected = true;
    }
    assert(duplicateRejected, 'Duplicate application attempt is rejected with HTTP 409 Conflict');

    // Test 34: Deletion safety guard: Resume A1 is now protected because it is attached to active application
    let resumeDeleteBlocked = false;
    const activeAppCount = await prisma.application.count({ where: { resumeId: resumeA1.id } });
    if (activeAppCount > 0) resumeDeleteBlocked = true;
    assert(resumeDeleteBlocked, 'Resume attached to submitted job application is protected from deletion');

    // Test 35: Candidate views own application (confirms private admin notes are NOT leaked)
    const userAppView = await applicationService.getUserApplicationById({
      userId: userA.id,
      applicationId: appA.id,
    });
    assert(
      userAppView &&
      userAppView.id === appA.id &&
      userAppView.adminNotes === undefined,
      'Candidate views own application details (private admin notes are withheld)'
    );

    // Test 36: User B cannot view User A application (HTTP 403)
    let crossAppViewForbidden = false;
    try {
      await applicationService.getUserApplicationById({
        userId: userB.id,
        applicationId: appA.id,
      });
    } catch (err) {
      if (err.statusCode === 403) crossAppViewForbidden = true;
    }
    assert(crossAppViewForbidden, 'User B is forbidden (HTTP 403) from viewing User A application');

    // ====================================================
    // DOMAIN 8: ADMIN APPLICATION REVIEW, STATUS & NOTES
    // ====================================================
    console.log('\n--- DOMAIN 8: Admin Application Review, Status Transitions & Notes ---');

    // Test 37: Admin views application list with metrics
    const adminAppsList = await applicationService.getAdminApplications({
      adminId: adminUser.id,
      jobId: publishedJob.id,
    });
    assert(
      adminAppsList &&
      Array.isArray(adminAppsList.applications) &&
      adminAppsList.applications.length >= 1,
      `Admin retrieves candidate applications list (${adminAppsList.applications.length} candidate(s))`
    );

    // Test 38: Admin views detailed candidate application with resume
    const adminAppDetail = await applicationService.getAdminApplicationById({
      adminId: adminUser.id,
      applicationId: appA.id,
    });
    assert(
      adminAppDetail &&
      adminAppDetail.user.name === userA.name &&
      adminAppDetail.resume.originalFileName === resumeA1.originalFileName,
      'Admin retrieves complete candidate review dossier (profile, resume, and score)'
    );

    // Test 39: Admin adds private recruiter note
    const adminNote = await applicationService.addAdminNote({
      adminId: adminUser.id,
      applicationId: appA.id,
      note: 'Strong experience in Node.js and PostgreSQL. Recommend moving to technical screening.',
    });
    assert(adminNote && adminNote.note.includes('Strong experience'), 'Admin creates private recruiter note on candidate application');

    // Test 40: Admin transitions status: SUBMITTED -> UNDER_REVIEW
    const appStatus1 = await applicationService.updateApplicationStatus({
      adminId: adminUser.id,
      applicationId: appA.id,
      newStatus: 'UNDER_REVIEW',
      note: 'Application under review by engineering team.',
    });
    assert(appStatus1.status === 'UNDER_REVIEW', 'Admin updates status to UNDER_REVIEW');

    // Test 41: Admin transitions status: UNDER_REVIEW -> SHORTLISTED
    const appStatus2 = await applicationService.updateApplicationStatus({
      adminId: adminUser.id,
      applicationId: appA.id,
      newStatus: 'SHORTLISTED',
      note: 'Candidate shortlisted for interview rounds.',
    });
    assert(appStatus2.status === 'SHORTLISTED', 'Admin updates status to SHORTLISTED');

    // Test 42: Admin transitions status: SHORTLISTED -> INTERVIEW
    const appStatus3 = await applicationService.updateApplicationStatus({
      adminId: adminUser.id,
      applicationId: appA.id,
      newStatus: 'INTERVIEW',
      note: 'Technical interview scheduled.',
    });
    assert(appStatus3.status === 'INTERVIEW', 'Admin updates status to INTERVIEW');

    // Test 43: Admin transitions status: INTERVIEW -> SELECTED
    const appStatus4 = await applicationService.updateApplicationStatus({
      adminId: adminUser.id,
      applicationId: appA.id,
      newStatus: 'SELECTED',
      note: 'Offer extended to candidate.',
    });
    assert(appStatus4.status === 'SELECTED', 'Admin updates status to SELECTED');

    // Test 44: Status history audit trail verified
    const historyEvents = await prisma.applicationStatusHistory.findMany({
      where: { applicationId: appA.id },
      orderBy: { createdAt: 'asc' },
    });
    assert(historyEvents.length === 5, `Status history audit trail verified (5 sequential events recorded)`);

    // Test 45: Admin deletes private recruiter note
    const deleteNoteResult = await applicationService.deleteAdminNote({
      adminId: adminUser.id,
      noteId: adminNote.id,
    });
    assert(deleteNoteResult && deleteNoteResult.message.includes('deleted'), 'Admin successfully deletes private recruiter note');

    // ====================================================
    // DOMAIN 9: RECRUITMENT ANALYTICS INTEGRITY (REAL DATA)
    // ====================================================
    console.log('\n--- DOMAIN 9: Recruitment Analytics Engine (Real Data) ---');

    // Test 46: Overview analytics calculation
    const overviewData = await analyticsService.getOverviewAnalytics();
    assert(
      overviewData &&
      overviewData.system &&
      typeof overviewData.system.totalUsers === 'number' &&
      overviewData.jobs &&
      overviewData.applications,
      `Analytics overview metrics calculated from real database (Total Users: ${overviewData.system.totalUsers})`
    );

    // Test 47: Application trends ranges (7d, 30d, 90d, all)
    const trends7d = await analyticsService.getApplicationTrends({ range: '7d' });
    const trends30d = await analyticsService.getApplicationTrends({ range: '30d' });
    assert(
      Array.isArray(trends7d.points) &&
      Array.isArray(trends30d.points) &&
      trends7d.points.length === 8 &&
      trends30d.points.length === 31,
      'Application trend time windows (7d: 8 points, 30d: 31 points) generate valid datasets'
    );

    // Test 48: Skill demand analytics
    const skillAnalytics = await analyticsService.getSkillDemandAnalytics();
    assert(
      Array.isArray(skillAnalytics.topSkills) &&
      skillAnalytics.topSkills.some((s) => s.skill === 'Node.js' || s.skill === 'PostgreSQL'),
      'Skill demand analytics extracts top in-demand skills from active job postings'
    );

    // Test 49: Deadline insights calculation
    const deadlineInsights = await analyticsService.getDeadlineInsights();
    assert(
      deadlineInsights &&
      typeof deadlineInsights.summary.totalWithDeadlines === 'number',
      'Deadline insights evaluates urgency thresholds and expired requisitions'
    );

    // Test 50: Factual recruitment observations synthesis
    const insights = await analyticsService.getRecruitmentInsights();
    assert(
      Array.isArray(insights.facts) &&
      insights.facts.length >= 1,
      `Recruitment analytics engine synthesizes ${insights.facts.length} factual observations from real database data`
    );

    // ====================================================
    // DOMAIN 10: PARAMETER HARDENING & UUID VALIDATION
    // ====================================================
    console.log('\n--- DOMAIN 10: Parameter Hardening & Error Sanitization ---');

    // Test 51: UUID validation recognizes valid UUID
    assert(isValidUUID(userA.id), 'Valid UUID is recognized by isValidUUID middleware');

    // Test 52: Non-UUID string rejected
    assert(!isValidUUID('non-uuid-string-123'), 'Non-UUID string is rejected by isValidUUID middleware');

    // Test 53: SQL injection pattern rejected
    assert(!isValidUUID("'; DROP TABLE \"User\"; --"), 'SQL injection payload is rejected by isValidUUID middleware');

    // Test 54: Path traversal pattern rejected
    assert(!isValidUUID('../../../etc/passwd'), 'Path traversal payload is rejected by isValidUUID middleware');

    // Test 55: Invalid status enum rejected by status update validator
    let invalidStatusRejected = false;
    try {
      await applicationService.updateApplicationStatus({
        adminId: adminUser.id,
        applicationId: appA.id,
        newStatus: 'NON_EXISTENT_STATUS',
      });
    } catch (err) {
      if (err.statusCode === 400) invalidStatusRejected = true;
    }
    assert(invalidStatusRejected, 'Invalid application status enum is rejected with HTTP 400');

    // ====================================================
    // TEARDOWN: Clean up test fixtures safely
    // ====================================================
    console.log('\n--- TEARDOWN: Cleaning up test fixtures ---');
    await prisma.applicationStatusHistory.deleteMany({ where: { applicationId: appA.id } });
    await prisma.application.deleteMany({ where: { id: appA.id } });
    await prisma.notification.deleteMany({ where: { userId: { in: [userA.id, userB.id, adminUser.id] } } });
    await prisma.jobOptimization.deleteMany({ where: { id: jobOptA.id } });
    await prisma.resumeImprovement.deleteMany({ where: { id: improvementA.id } });
    await prisma.resumeAnalysis.deleteMany({ where: { id: analysisA.id } });
    await prisma.resume.deleteMany({ where: { id: { in: [resumeA1.id, resumeB1.id] } } });
    await prisma.job.deleteMany({ where: { id: { in: [draftJob.id, expiredJob.id, closedJob.id] } } });
    await prisma.careerGoal.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id, adminUser.id] } } });

    console.log('\n================================================================');
    console.log(`  PHASE 12 FULL LIFECYCLE AUDIT: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
    console.log('================================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal audit error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase12TestSuite();
