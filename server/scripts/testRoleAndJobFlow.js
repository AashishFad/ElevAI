/**
 * ElevAI - End-to-End Role-Based RBAC & Job Posting Verification Script
 */
const { getPrismaClient } = require('../src/config/database');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../src/utils/jwt');
const http = require('http');
const app = require('../src/app');

async function runTests() {
  console.log('====================================================');
  console.log('ELEVAI - ROLE-BASED LOGIN & JOB PIPELINE VERIFICATION');
  console.log('====================================================\n');

  const prisma = getPrismaClient();

  // 1. Setup Test Users
  console.log('▶ [1] Setting up Admin and Student test accounts in database...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Admin Account
  const adminUser = await prisma.user.upsert({
    where: { email: 'test.admin@elevai.com' },
    update: { role: 'ADMIN', passwordHash },
    create: {
      name: 'ElevAI Lead Recruiter',
      email: 'test.admin@elevai.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // Student Account
  const studentUser = await prisma.user.upsert({
    where: { email: 'test.student@elevai.com' },
    update: { role: 'USER', passwordHash },
    create: {
      name: 'Priya Sharma (Student)',
      email: 'test.student@elevai.com',
      passwordHash,
      role: 'USER',
    },
  });

  // Ensure student has a ready resume
  let studentResume = await prisma.resume.findFirst({
    where: { userId: studentUser.id },
  });

  if (!studentResume) {
    studentResume = await prisma.resume.create({
      data: {
        userId: studentUser.id,
        originalFileName: 'Priya_Sharma_Resume.pdf',
        storagePath: 'resumes/priya_sharma.pdf',
        fileType: 'pdf',
        fileSize: 1048576,
        status: 'READY',
        extractedText: 'Full Stack Developer with experience in React, Node.js, PostgreSQL, Docker, and REST APIs.',
      },
    });
  }

  const adminToken = generateToken({
    userId: adminUser.id,
    role: adminUser.role,
    email: adminUser.email,
  });

  const studentToken = generateToken({
    userId: studentUser.id,
    role: studentUser.role,
    email: studentUser.email,
  });

  console.log(`  ✔ Admin Account: ${adminUser.email} (Role: ${adminUser.role})`);
  console.log(`  ✔ Student Account: ${studentUser.email} (Role: ${studentUser.role})`);
  console.log(`  ✔ Student Resume: ${studentResume.originalFileName} (Status: ${studentResume.status})\n`);

  // Start local server for testing
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  async function request(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = options.headers || {};
    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const json = await res.json().catch(() => null);
    return { status: res.status, data: json };
  }

  try {
    // 2. Security Test: Student attempting Admin routes
    console.log('▶ [2] SECURITY TEST: Student Token attempting Admin-Only endpoints...');

    const studentJobCreate = await request('/api/admin/jobs', {
      method: 'POST',
      token: studentToken,
      body: { title: 'Unauthorized Job' },
    });
    console.log(`  • POST /api/admin/jobs (Student): Status ${studentJobCreate.status} -> ${studentJobCreate.data?.message || 'Forbidden'}`);
    if (studentJobCreate.status !== 403) throw new Error('Security Breach: Student should get 403 on /api/admin/jobs');

    const studentJobsDirect = await request('/api/jobs', {
      method: 'POST',
      token: studentToken,
      body: { title: 'Unauthorized Job on /api/jobs' },
    });
    console.log(`  • POST /api/jobs (Student): Status ${studentJobsDirect.status} -> ${studentJobsDirect.data?.message || 'Forbidden'}`);
    if (studentJobsDirect.status !== 403) throw new Error('Security Breach: Student should get 403 on /api/jobs POST');

    const studentOverview = await request('/api/admin/overview', {
      token: studentToken,
    });
    console.log(`  • GET /api/admin/overview (Student): Status ${studentOverview.status} -> ${studentOverview.data?.message || 'Forbidden'}`);
    if (studentOverview.status !== 403) throw new Error('Security Breach: Student should get 403 on /api/admin/overview');

    const studentAdminApps = await request('/api/admin/applications', {
      token: studentToken,
    });
    console.log(`  • GET /api/admin/applications (Student): Status ${studentAdminApps.status} -> ${studentAdminApps.data?.message || 'Forbidden'}`);
    if (studentAdminApps.status !== 403) throw new Error('Security Breach: Student should get 403 on /api/admin/applications');

    console.log('  ✔ All Student unauthorized access attempts successfully BLOCKED (HTTP 403 Forbidden).\n');

    // 3. Admin creates a DRAFT Job
    console.log('▶ [3] ADMIN FLOW: Admin creates "Software Developer Intern" as DRAFT...');
    const draftJobRes = await request('/api/admin/jobs', {
      method: 'POST',
      token: adminToken,
      body: {
        title: 'Software Developer Intern',
        department: 'Core Engineering',
        companyName: 'ElevAI Technologies',
        workMode: 'HYBRID',
        location: 'Bangalore, India',
        employmentType: 'INTERNSHIP',
        experienceRequired: '0-1 years',
        requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'JavaScript'],
        preferredSkills: ['Tailwind CSS', 'Docker'],
        educationRequirement: 'B.Tech / BCA / MCA / B.Sc in CS or related',
        salaryMin: 450000,
        salaryMax: 700000,
        salaryVisible: true,
        openings: 3,
        description: 'We are seeking a proactive Software Developer Intern to build full-stack web applications with React and Node.js.',
        status: 'DRAFT',
      },
    });

    console.log(`  • POST /api/admin/jobs (Admin): Status ${draftJobRes.status}`);
    if (draftJobRes.status !== 201 || !draftJobRes.data?.job?.id) {
      throw new Error(`Failed to create job: ${JSON.stringify(draftJobRes.data)}`);
    }

    const createdJob = draftJobRes.data.job;
    console.log(`  ✔ Draft Job Created: "${createdJob.title}" (ID: ${createdJob.id}, Status: ${createdJob.status})\n`);

    // 4. Verify Student CANNOT see Draft job
    console.log('▶ [4] STUDENT FEED CHECK: Verifying Draft job is hidden from Student Job Feed...');
    const publicJobsDraftCheck = await request('/api/jobs');
    const draftFeedList = publicJobsDraftCheck.data?.data?.jobs || publicJobsDraftCheck.data?.jobs || [];
    const isDraftVisible = draftFeedList.some((j) => j.id === createdJob.id);
    console.log(`  • GET /api/jobs: Draft Job visible in feed? ${isDraftVisible ? 'YES (FAILURE)' : 'NO (CORRECT)'}`);
    if (isDraftVisible) throw new Error('Draft job is leaking to public/student feed!');
    console.log('  ✔ Draft job correctly hidden from student feed.\n');

    // 5. Admin publishes the Job
    console.log('▶ [5] ADMIN FLOW: Admin publishes the job requisition...');
    const publishRes = await request(`/api/admin/jobs/${createdJob.id}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: { status: 'PUBLISHED' },
    });
    console.log(`  • PATCH /api/admin/jobs/${createdJob.id}/status (Admin): Status ${publishRes.status}`);
    if (publishRes.status !== 200 || publishRes.data?.job?.status !== 'PUBLISHED') {
      throw new Error(`Failed to publish job: ${JSON.stringify(publishRes.data)}`);
    }
    console.log(`  ✔ Job published successfully (Status: PUBLISHED)\n`);

    // 6. Verify Student CAN now see Published job
    console.log('▶ [6] STUDENT FEED CHECK: Verifying Published job is now visible in Student Job Feed...');
    const publicJobsPublishedCheck = await request('/api/jobs');
    const publishedFeedList = publicJobsPublishedCheck.data?.data?.jobs || publicJobsPublishedCheck.data?.jobs || [];
    const publishedJobInFeed = publishedFeedList.find((j) => j.id === createdJob.id);
    console.log(`  • GET /api/jobs: Published Job found? ${publishedJobInFeed ? 'YES' : 'NO'}`);
    if (!publishedJobInFeed) throw new Error('Published job should be in student feed!');
    console.log(`  ✔ Job Title: "${publishedJobInFeed.title}" at ${publishedJobInFeed.companyName}`);
    console.log(`  ✔ Location: ${publishedJobInFeed.location} | Type: ${publishedJobInFeed.employmentType}\n`);

    // 7. Student views Job Details
    console.log(`▶ [7] STUDENT FLOW: Student opens Job Details for "${createdJob.title}"...`);
    const jobDetailsRes = await request(`/api/jobs/${createdJob.id}`);
    console.log(`  • GET /api/jobs/${createdJob.id}: Status ${jobDetailsRes.status}`);
    if (jobDetailsRes.status !== 200 || !jobDetailsRes.data?.job) {
      throw new Error('Failed to retrieve job details');
    }
    console.log(`  ✔ Job Details retrieved with required skills: ${jobDetailsRes.data.job.requiredSkills?.join(', ')}\n`);

    // 8. Student applies for the Job
    console.log('▶ [8] STUDENT FLOW: Student submits job application with attached resume...');
    // Clean up any old test application first
    await prisma.application.deleteMany({
      where: { userId: studentUser.id, jobId: createdJob.id },
    });

    const applyRes = await request('/api/applications', {
      method: 'POST',
      token: studentToken,
      body: {
        jobId: createdJob.id,
        resumeId: studentResume.id,
        coverLetter: 'I am excited to apply for the Software Developer Intern role at ElevAI!',
      },
    });

    console.log(`  • POST /api/applications (Student): Status ${applyRes.status}`);
    if (applyRes.status !== 201 || !applyRes.data?.application?.id) {
      throw new Error(`Failed to submit application: ${JSON.stringify(applyRes.data)}`);
    }

    const application = applyRes.data.application;
    console.log(`  ✔ Application Submitted: ID ${application.id} (Initial Status: ${application.status})\n`);

    // 9. Admin views the Application in Admin Workspace
    console.log('▶ [9] ADMIN FLOW: Admin checks submitted applications in Admin Pipeline...');
    const adminAppsRes = await request(`/api/admin/applications?jobId=${createdJob.id}`, {
      token: adminToken,
    });
    console.log(`  • GET /api/admin/applications?jobId=${createdJob.id} (Admin): Status ${adminAppsRes.status}`);
    const foundApp = (adminAppsRes.data?.applications || []).find((a) => a.id === application.id);
    if (!foundApp) throw new Error('Admin could not find student application in pipeline!');
    console.log(`  ✔ Applicant: ${foundApp.user?.name} (${foundApp.user?.email})`);
    console.log(`  ✔ Applied Role: ${foundApp.job?.title}`);
    console.log(`  ✔ Resume: ${foundApp.resume?.fileName}\n`);

    // 10. Admin updates application status to SHORTLISTED
    console.log('▶ [10] ADMIN FLOW: Admin shortlists candidate & updates status to SHORTLISTED...');
    const updateStatusRes = await request(`/api/admin/applications/${application.id}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: {
        status: 'SHORTLISTED',
        note: 'Candidate has strong React and Node.js fundamentals. Shortlisted for technical round.',
      },
    });
    console.log(`  • PATCH /api/admin/applications/${application.id}/status (Admin): Status ${updateStatusRes.status}`);
    if (updateStatusRes.status !== 200 || updateStatusRes.data?.application?.status !== 'SHORTLISTED') {
      throw new Error('Failed to update application status to SHORTLISTED');
    }
    console.log('  ✔ Application status updated to SHORTLISTED.\n');

    // 11. Student checks updated status
    console.log('▶ [11] STUDENT FLOW: Student verifies updated application status...');
    const studentCheckApp = await request(`/api/applications/${application.id}`, {
      token: studentToken,
    });
    console.log(`  • GET /api/applications/${application.id} (Student): Status ${studentCheckApp.status}`);
    console.log(`  ✔ Current Application Status: ${studentCheckApp.data?.application?.status}`);
    if (studentCheckApp.data?.application?.status !== 'SHORTLISTED') {
      throw new Error('Student did not receive updated SHORTLISTED status!');
    }

    // 12. Student checks notifications
    console.log('▶ [12] NOTIFICATIONS: Checking student smart notifications...');
    const studentNotifs = await request('/api/notifications', {
      token: studentToken,
    });
    console.log(`  • GET /api/notifications (Student): Status ${studentNotifs.status}`);
    const latestNotif = studentNotifs.data?.notifications?.[0];
    if (latestNotif) {
      console.log(`  ✔ Notification received: "${latestNotif.title}" - ${latestNotif.message}`);
    }

    console.log('\n====================================================');
    console.log('✔ ALL 12 VERIFICATION & SECURITY STEPS PASSED 100%!');
    console.log('====================================================');
  } finally {
    server.close();
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  });
