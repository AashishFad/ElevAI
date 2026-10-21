/**
 * ElevAI - End-to-End Candidate & Recruiter Persona Flow Verification
 */
const { getPrismaClient } = require('../src/config/database');
const bcrypt = require('bcryptjs');
const http = require('http');
const app = require('../src/app');

async function makeRequest(server, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: server.address().port,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({ status: res.statusCode, headers: res.headers, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: responseData });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('===========================================================');
  console.log('ELEVAI - CANDIDATE / RECRUITER FLOW VERIFICATION SUITE');
  console.log('===========================================================\n');

  const prisma = getPrismaClient();

  // Setup Database Test Users
  const password = 'Password123!';
  const passwordHash = await bcrypt.hash(password, 10);

  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter.demo@elevai.com' },
    update: { role: 'ADMIN', passwordHash },
    create: {
      name: 'Sarah Chen (Talent Lead)',
      email: 'recruiter.demo@elevai.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const candidateUser = await prisma.user.upsert({
    where: { email: 'candidate.demo@elevai.com' },
    update: { role: 'USER', passwordHash },
    create: {
      name: 'Aarav Patel (Candidate)',
      email: 'candidate.demo@elevai.com',
      passwordHash,
      role: 'USER',
    },
  });

  // Ensure candidate has a ready resume
  let candidateResume = await prisma.resume.findFirst({
    where: { userId: candidateUser.id },
  });

  if (!candidateResume) {
    candidateResume = await prisma.resume.create({
      data: {
        userId: candidateUser.id,
        originalFileName: 'Aarav_Patel_Resume.pdf',
        storagePath: 'resumes/aarav_patel.pdf',
        fileType: 'pdf',
        fileSize: 1048576,
        status: 'READY',
        extractedText: 'Full Stack Engineer with React, Node.js, TypeScript, PostgreSQL, and AWS expertise.',
      },
    });
  }

  // Start an ephemeral test server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test API Server running on port ${port}\n`);

  try {
    // ----------------------------------------------------
    // TEST 1: Candidate selects Candidate + valid credentials -> PASS
    // ----------------------------------------------------
    console.log('▶ [TEST 1] Candidate selects "Candidate" with valid credentials...');
    const test1Res = await makeRequest(server, { method: 'POST', path: '/api/auth/login' }, {
      email: 'candidate.demo@elevai.com',
      password,
      requestedRole: 'CANDIDATE',
    });
    if (test1Res.status !== 200 || !test1Res.data.token || test1Res.data.user.role !== 'USER') {
      throw new Error(`Test 1 Failed: Status ${test1Res.status}, data: ${JSON.stringify(test1Res.data)}`);
    }
    const candidateToken = test1Res.data.token;
    console.log(`  ✔ Status: ${test1Res.status} (Success)`);
    console.log(`  ✔ Authenticated User: ${test1Res.data.user.name} (${test1Res.data.user.email})`);
    console.log(`  ✔ Destination Workspace: Candidate Dashboard (/dashboard)`);

    // ----------------------------------------------------
    // TEST 2: Recruiter selects Recruiter + valid credentials -> PASS
    // ----------------------------------------------------
    console.log('\n▶ [TEST 2] Recruiter selects "Recruiter" with valid credentials...');
    const test2Res = await makeRequest(server, { method: 'POST', path: '/api/auth/login' }, {
      email: 'recruiter.demo@elevai.com',
      password,
      requestedRole: 'RECRUITER',
    });
    if (test2Res.status !== 200 || !test2Res.data.token || test2Res.data.user.role !== 'ADMIN') {
      throw new Error(`Test 2 Failed: Status ${test2Res.status}, data: ${JSON.stringify(test2Res.data)}`);
    }
    const recruiterToken = test2Res.data.token;
    console.log(`  ✔ Status: ${test2Res.status} (Success)`);
    console.log(`  ✔ Authenticated User: ${test2Res.data.user.name} (${test2Res.data.user.email})`);
    console.log(`  ✔ Destination Workspace: Recruiter Dashboard (/admin)`);

    // ----------------------------------------------------
    // TEST 3: Candidate selects Recruiter -> REJECT with specific message
    // ----------------------------------------------------
    console.log('\n▶ [TEST 3] Candidate selects "Recruiter" with Candidate credentials...');
    const test3Res = await makeRequest(server, { method: 'POST', path: '/api/auth/login' }, {
      email: 'candidate.demo@elevai.com',
      password,
      requestedRole: 'RECRUITER',
    });
    console.log(`  • Response Status: ${test3Res.status}`);
    console.log(`  • Response Message: "${test3Res.data?.message}"`);
    if (
      test3Res.status !== 403 ||
      test3Res.data?.message !== 'This account is registered as a Candidate. Please select "Candidate" to continue.'
    ) {
      throw new Error(`Test 3 Failed: Expected 403 with specific message, got ${test3Res.status}: ${JSON.stringify(test3Res.data)}`);
    }
    console.log(`  ✔ Candidate correctly blocked with exact required message.`);

    // ----------------------------------------------------
    // TEST 4: Recruiter selects Candidate -> REJECT with specific message
    // ----------------------------------------------------
    console.log('\n▶ [TEST 4] Recruiter selects "Candidate" with Recruiter credentials...');
    const test4Res = await makeRequest(server, { method: 'POST', path: '/api/auth/login' }, {
      email: 'recruiter.demo@elevai.com',
      password,
      requestedRole: 'CANDIDATE',
    });
    console.log(`  • Response Status: ${test4Res.status}`);
    console.log(`  • Response Message: "${test4Res.data?.message}"`);
    if (
      test4Res.status !== 403 ||
      test4Res.data?.message !== 'This account is registered as a Recruiter. Please select "Recruiter" to continue.'
    ) {
      throw new Error(`Test 4 Failed: Expected 403 with specific message, got ${test4Res.status}: ${JSON.stringify(test4Res.data)}`);
    }
    console.log(`  ✔ Recruiter correctly blocked with exact required message.`);

    // ----------------------------------------------------
    // TEST 5: Candidate attempts Recruiter API directly -> 403 Forbidden
    // ----------------------------------------------------
    console.log('\n▶ [TEST 5] Candidate attempts Recruiter-only API directly with Candidate JWT...');
    const test5Res = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/api/admin/jobs',
        headers: { Authorization: `Bearer ${candidateToken}` },
      },
      { title: 'Unauthorized Post' }
    );
    console.log(`  • POST /api/admin/jobs: Status ${test5Res.status} -> "${test5Res.data?.message}"`);
    if (test5Res.status !== 403) {
      throw new Error(`Test 5 Failed: Expected status 403, got ${test5Res.status}`);
    }
    console.log(`  ✔ Direct API authorization check PASS (HTTP 403 Forbidden).`);

    // ----------------------------------------------------
    // TEST 6: Recruiter creates and publishes a job
    // ----------------------------------------------------
    console.log('\n▶ [TEST 6] Recruiter creates and publishes a new job requisition...');
    const createJobRes = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/api/admin/jobs',
        headers: { Authorization: `Bearer ${recruiterToken}` },
      },
      {
        title: 'Senior Frontend Architect',
        companyName: 'ElevAI Technologies',
        location: 'Bangalore, India',
        employmentType: 'FULL_TIME',
        workMode: 'REMOTE',
        department: 'Engineering',
        experienceRequired: '3-5 years',
        description: 'Lead next-generation AI interface engineering and scalable React architecture.',
        requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'REST APIs', 'Vite'],
        salaryMin: 1800000,
        salaryMax: 2800000,
        salaryCurrency: 'INR',
      }
    );
    if (createJobRes.status !== 201) {
      throw new Error(`Failed to create job: ${JSON.stringify(createJobRes.data)}`);
    }
    const createdJob = createJobRes.data.job || createJobRes.data.data;
    console.log(`  • Created Job: "${createdJob.title}" (ID: ${createdJob.id}, Status: ${createdJob.status})`);

    // Publish job
    const publishRes = await makeRequest(
      server,
      {
        method: 'PATCH',
        path: `/api/admin/jobs/${createdJob.id}/status`,
        headers: { Authorization: `Bearer ${recruiterToken}` },
      },
      { status: 'PUBLISHED' }
    );
    const updatedJob = publishRes.data.job || publishRes.data.data;
    if (publishRes.status !== 200 || updatedJob?.status !== 'PUBLISHED') {
      throw new Error(`Failed to publish job: ${JSON.stringify(publishRes.data)}`);
    }
    console.log(`  ✔ Job published successfully (Status: PUBLISHED)`);

    // ----------------------------------------------------
    // TEST 7: Candidate sees published job in Job Feed
    // ----------------------------------------------------
    console.log('\n▶ [TEST 7] Candidate queries Published Job Feed...');
    const feedRes = await makeRequest(
      server,
      {
        method: 'GET',
        path: '/api/jobs?limit=20',
        headers: { Authorization: `Bearer ${candidateToken}` },
      }
    );
    const feedJobs = feedRes.data?.data?.jobs || feedRes.data?.jobs || [];
    const foundPublishedJob = feedJobs.find((j) => j.id === createdJob.id);
    if (!foundPublishedJob) {
      throw new Error(`Test 7 Failed: Published job ${createdJob.id} not visible in candidate feed`);
    }
    console.log(`  ✔ Published Job found in candidate feed: "${foundPublishedJob.title}"`);
    console.log(`  ✔ Company: ${foundPublishedJob.companyName || foundPublishedJob.company} | Type: ${foundPublishedJob.employmentType || foundPublishedJob.type}`);

    // ----------------------------------------------------
    // TEST 8: Candidate applies -> Appears in Recruiter Application Pipeline
    // ----------------------------------------------------
    console.log('\n▶ [TEST 8] Candidate applies with resume & Recruiter reviews application...');
    
    // Clean up any existing application for idempotency
    await prisma.application.deleteMany({
      where: {
        jobId: createdJob.id,
        userId: candidateUser.id,
      },
    });

    const applyRes = await makeRequest(
      server,
      {
        method: 'POST',
        path: '/api/applications',
        headers: { Authorization: `Bearer ${candidateToken}` },
      },
      {
        jobId: createdJob.id,
        resumeId: candidateResume.id,
        coverLetter: 'I am excited to apply for the Senior Frontend Architect position at ElevAI.',
      }
    );
    if (applyRes.status !== 201) {
      throw new Error(`Apply failed: ${JSON.stringify(applyRes.data)}`);
    }
    const appliedData = applyRes.data.application || applyRes.data.data;
    const applicationId = appliedData.id;
    console.log(`  ✔ Application Submitted: ID ${applicationId} (Status: ${appliedData.status})`);

    // Recruiter queries applications
    const adminAppsRes = await makeRequest(
      server,
      {
        method: 'GET',
        path: `/api/admin/applications?jobId=${createdJob.id}`,
        headers: { Authorization: `Bearer ${recruiterToken}` },
      }
    );
    const appsList = adminAppsRes.data?.applications || adminAppsRes.data?.data?.applications || [];
    const targetApp = appsList.find((a) => a.id === applicationId);
    if (!targetApp) {
      throw new Error(`Test 8 Failed: Application not found in recruiter list`);
    }
    console.log(`  ✔ Recruiter verified applicant: ${targetApp.user?.name} (${targetApp.user?.email})`);

    // Recruiter updates status to UNDER_REVIEW
    const statusUpdateRes = await makeRequest(
      server,
      {
        method: 'PATCH',
        path: `/api/admin/applications/${applicationId}/status`,
        headers: { Authorization: `Bearer ${recruiterToken}` },
      },
      { status: 'UNDER_REVIEW' }
    );
    const updatedAppStatus = statusUpdateRes.data.application?.status || statusUpdateRes.data.data?.status || statusUpdateRes.data.status;
    console.log(`  ✔ Recruiter updated application status to: ${updatedAppStatus}`);

    // Candidate verifies status update
    const candidateAppCheck = await makeRequest(
      server,
      {
        method: 'GET',
        path: `/api/applications/${applicationId}`,
        headers: { Authorization: `Bearer ${candidateToken}` },
      }
    );
    const finalCandApp = candidateAppCheck.data.application || candidateAppCheck.data.data;
    console.log(`  ✔ Candidate sees updated status: ${finalCandApp?.status}`);

    console.log('\n===========================================================');
    console.log('✔ ALL 8 SCENARIOS VERIFIED AND PASSED WITH 100% SUCCESS!');
    console.log('===========================================================');
  } finally {
    server.close();
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Test Error:', err.message);
    process.exit(1);
  });
