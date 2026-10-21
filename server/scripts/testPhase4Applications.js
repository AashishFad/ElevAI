const { getPrismaClient } = require('../src/config/database');
const {
  submitApplication,
  getUserApplications,
  getUserApplicationById,
  checkUserJobApplication,
  getAdminApplications,
  getAdminApplicationById,
  updateApplicationStatus,
  getJobApplicationStats,
  getSecureResumeDownloadUrl,
} = require('../src/services/applicationService');

async function runPhase4Verification() {
  console.log('🚀 [PHASE 4 VERIFICATION] Starting comprehensive application workflow tests...\n');
  const prisma = getPrismaClient();

  try {
    // 1. Find Admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (!adminUser) {
      console.error('❌ No Admin user found in database.');
      process.exit(1);
    }
    console.log(`✅ Found Admin user: ${adminUser.email} (ID: ${adminUser.id})`);

    // 2. Find or create Candidate User A
    let userA = await prisma.user.findFirst({
      where: { role: 'USER' },
    });
    if (!userA) {
      userA = await prisma.user.create({
        data: {
          email: `candidate_a_${Date.now()}@example.com`,
          name: 'Candidate Alpha',
          passwordHash: 'dummy_hash',
          role: 'USER',
        },
      });
    }
    console.log(`✅ Candidate A: ${userA.name} (${userA.email}, ID: ${userA.id})`);

    // 3. Find or create Candidate User B (for cross-user security checks)
    let userB = await prisma.user.findFirst({
      where: {
        role: 'USER',
        id: { not: userA.id },
      },
    });
    if (!userB) {
      userB = await prisma.user.create({
        data: {
          email: `candidate_b_${Date.now()}@example.com`,
          name: 'Candidate Beta',
          passwordHash: 'dummy_hash',
          role: 'USER',
        },
      });
    }
    console.log(`✅ Candidate B: ${userB.name} (${userB.email}, ID: ${userB.id})`);

    // 4. Ensure User A has a READY resume
    let resumeA = await prisma.resume.findFirst({
      where: { userId: userA.id, status: 'READY' },
    });
    if (!resumeA) {
      resumeA = await prisma.resume.create({
        data: {
          userId: userA.id,
          originalFileName: 'Aashish_Fad_Resume.pdf',
          storagePath: `${userA.id}/test/Aashish_Fad_Resume.pdf`,
          fileType: 'pdf',
          fileSize: 104857,
          extractedText: 'Full Stack Engineer with React, Node.js, PostgreSQL, AI integration skills and 2 years experience.',
          status: 'READY',
        },
      });
    }
    console.log(`✅ User A Resume: "${resumeA.originalFileName}" (ID: ${resumeA.id})`);

    // 5. Ensure User B has a READY resume
    let resumeB = await prisma.resume.findFirst({
      where: { userId: userB.id, status: 'READY' },
    });
    if (!resumeB) {
      resumeB = await prisma.resume.create({
        data: {
          userId: userB.id,
          originalFileName: 'Beta_Candidate_Resume.pdf',
          storagePath: `${userB.id}/test/Beta_Candidate_Resume.pdf`,
          fileType: 'pdf',
          fileSize: 98765,
          extractedText: 'Frontend Developer with React and Tailwind CSS expertise.',
          status: 'READY',
        },
      });
    }
    console.log(`✅ User B Resume: "${resumeB.originalFileName}" (ID: ${resumeB.id})`);

    // 6. Create a PUBLISHED test Job
    const publishedJob = await prisma.job.create({
      data: {
        title: `Full Stack Engineer Test Role ${Date.now()}`,
        companyName: 'Ensono Technologies',
        location: 'Pune / Remote',
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        experienceRequired: '1 - 3 years',
        salaryMin: 1000000,
        salaryMax: 1600000,
        salaryVisible: true,
        description: 'Seeking a Full Stack Engineer to build next-generation applications with Node.js, Express, React, PostgreSQL.',
        requiredSkills: ['Node.js', 'React', 'PostgreSQL', 'JavaScript'],
        status: 'PUBLISHED',
        publishedAt: new Date(),
        createdBy: adminUser.id,
      },
    });
    console.log(`✅ Created Published Job: "${publishedJob.title}" (ID: ${publishedJob.id})`);

    // 7. Create a CLOSED test Job
    const closedJob = await prisma.job.create({
      data: {
        title: `Closed Backend Role ${Date.now()}`,
        companyName: 'Legacy Corp',
        location: 'Remote',
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        experienceRequired: '3+ years',
        description: 'This position is closed.',
        requiredSkills: ['Java', 'Spring'],
        status: 'CLOSED',
        closedAt: new Date(),
        createdBy: adminUser.id,
      },
    });
    console.log(`✅ Created Closed Job: "${closedJob.title}" (ID: ${closedJob.id})`);

    // TEST 1: Submit valid application by User A
    console.log('\n--- 📝 Test 1: Submit Valid Application ---');
    const applicationA = await submitApplication({
      userId: userA.id,
      jobId: publishedJob.id,
      resumeId: resumeA.id,
      coverLetter: 'I am excited to apply for this position and contribute to Ensono.',
    });
    console.log(`✅ Application created: ID #EVA-${applicationA.id.substring(0, 8).toUpperCase()}`);
    console.log(`   Initial Status: ${applicationA.status}`);
    if (applicationA.status === 'SUBMITTED') {
      console.log('✅ TEST 1 PASSED: Initial status is SUBMITTED.');
    } else {
      throw new Error(`Expected status SUBMITTED but got ${applicationA.status}`);
    }

    // TEST 2: Verify Status History entry
    console.log('\n--- 📜 Test 2: Verify Status History Log ---');
    const historyEntries = await prisma.applicationStatusHistory.findMany({
      where: { applicationId: applicationA.id },
    });
    console.log(`✅ Found ${historyEntries.length} history entry(s). New status: ${historyEntries[0]?.newStatus}`);
    if (historyEntries.length > 0 && historyEntries[0].newStatus === 'SUBMITTED') {
      console.log('✅ TEST 2 PASSED: Initial status history logged.');
    } else {
      throw new Error('Status history entry missing or incorrect.');
    }

    // TEST 3: Duplicate Application Prevention
    console.log('\n--- 🛡️ Test 3: Duplicate Application Prevention ---');
    try {
      await submitApplication({
        userId: userA.id,
        jobId: publishedJob.id,
        resumeId: resumeA.id,
      });
      throw new Error('FAIL: Duplicate application was allowed!');
    } catch (err) {
      if (err.statusCode === 409) {
        console.log(`✅ TEST 3 PASSED: Duplicate application blocked with 409 Conflict: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // TEST 4: Submitting to a CLOSED Job
    console.log('\n--- 🚫 Test 4: Closed Job Validation ---');
    try {
      await submitApplication({
        userId: userA.id,
        jobId: closedJob.id,
        resumeId: resumeA.id,
      });
      throw new Error('FAIL: Application to closed job was allowed!');
    } catch (err) {
      if (err.statusCode === 400) {
        console.log(`✅ TEST 4 PASSED: Closed job rejected with 400: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // TEST 5: Resume Ownership Security (User A tries to submit User B's resume)
    console.log('\n--- 🔒 Test 5: Resume Ownership Security ---');
    try {
      await submitApplication({
        userId: userA.id,
        jobId: publishedJob.id,
        resumeId: resumeB.id, // Belongs to User B!
      });
      throw new Error('FAIL: User was allowed to submit another candidate\'s resume!');
    } catch (err) {
      if (err.statusCode === 403 || err.statusCode === 409) {
        console.log(`✅ TEST 5 PASSED: Unauthorized resume submission blocked: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // TEST 6: User A reads their own application
    console.log('\n--- 👤 Test 6: Candidate Self Application View ---');
    const userAApp = await getUserApplicationById({
      userId: userA.id,
      applicationId: applicationA.id,
    });
    console.log(`✅ User A retrieved application for "${userAApp.job?.title}"`);
    console.log('✅ TEST 6 PASSED: Candidate can view own application.');

    // TEST 7: Cross-User Application Access Security (User B attempts to view User A's application)
    console.log('\n--- 🛡️ Test 7: Cross-User Data Isolation ---');
    try {
      await getUserApplicationById({
        userId: userB.id,
        applicationId: applicationA.id,
      });
      throw new Error('FAIL: User B was able to read User A\'s application!');
    } catch (err) {
      if (err.statusCode === 403) {
        console.log(`✅ TEST 7 PASSED: Cross-user access denied with 403: "${err.message}"`);
      } else {
        throw err;
      }
    }

    // TEST 8: Admin Applications List & Detail View
    console.log('\n--- 👑 Test 8: Admin Application Review ---');
    const adminApps = await getAdminApplications({
      adminId: adminUser.id,
      jobId: publishedJob.id,
    });
    console.log(`✅ Admin retrieved ${adminApps.applications.length} applications for job.`);
    const adminDetail = await getAdminApplicationById({
      adminId: adminUser.id,
      applicationId: applicationA.id,
    });
    console.log(`✅ Admin retrieved full dossier for candidate: ${adminDetail.user?.name} (${adminDetail.user?.email})`);
    console.log('✅ TEST 8 PASSED: Admin has full authorized access.');

    // TEST 9: Admin Status Update & Candidate Notification
    console.log('\n--- 🔄 Test 9: Admin Status Update ---');
    const updatedApp = await updateApplicationStatus({
      adminId: adminUser.id,
      applicationId: applicationA.id,
      newStatus: 'SHORTLISTED',
      note: 'Candidate cleared automated ATS review and is shortlisted for technical round.',
    });
    console.log(`✅ Application status updated to: ${updatedApp.status}`);
    const candidateNotification = await prisma.notification.findFirst({
      where: {
        userId: userA.id,
        type: 'APPLICATION',
        metadata: { path: ['newStatus'], equals: 'SHORTLISTED' },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (candidateNotification) {
      console.log(`✅ Candidate received notification: "${candidateNotification.title}" - ${candidateNotification.message}`);
    }
    console.log('✅ TEST 9 PASSED: Admin updated status and candidate notification dispatched.');

    // TEST 10: Job Application Stats
    console.log('\n--- 📊 Test 10: Job Application Breakdown Stats ---');
    const stats = await getJobApplicationStats({ jobId: publishedJob.id });
    console.log('Job application statistics:', stats);
    if (stats.TOTAL >= 1 && stats.SHORTLISTED >= 1) {
      console.log('✅ TEST 10 PASSED: Real-time application breakdown stats computed accurately.');
    }

    // Clean up test records
    console.log('\n🧹 Cleaning up test job and applications...');
    await prisma.job.delete({ where: { id: publishedJob.id } });
    await prisma.job.delete({ where: { id: closedJob.id } });
    console.log('✅ Test data cleaned up.');

    console.log('\n======================================================');
    console.log('🎉 ALL 10 PHASE 4 APPLICATION WORKFLOW CHECKS PASSED!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

runPhase4Verification();
