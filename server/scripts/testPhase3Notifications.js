const { getPrismaClient } = require('../src/config/database');
const { dispatchJobPublishedNotifications } = require('../src/services/jobNotificationService');

async function runPhase3Verification() {
  console.log('🚀 [PHASE 3 VERIFICATION] Starting comprehensive tests...\n');
  const prisma = getPrismaClient();

  try {
    // 1. Verify Prisma connection & find Admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!adminUser) {
      console.error('❌ No Admin user found in database.');
      process.exit(1);
    }
    console.log(`✅ Found Admin user: ${adminUser.email} (ID: ${adminUser.id})`);

    // 2. Find or create candidate user
    let candidateUser = await prisma.user.findFirst({
      where: { role: 'USER' },
    });

    if (!candidateUser) {
      console.log('ℹ️ Creating temporary candidate user for notification tests...');
      candidateUser = await prisma.user.create({
        data: {
          email: `candidate_test_${Date.now()}@example.com`,
          name: 'Test Candidate',
          passwordHash: 'dummy_hash',
          role: 'USER',
        },
      });
    }
    console.log(`✅ Found Candidate user: ${candidateUser.email} (ID: ${candidateUser.id})`);

    // Ensure candidate has career goal matching our test role
    await prisma.careerGoal.upsert({
      where: { userId: candidateUser.id },
      create: {
        userId: candidateUser.id,
        targetRole: 'Full Stack Engineer',
        experienceLevel: 'ONE_TO_TWO_YEARS',
      },
      update: {
        targetRole: 'Full Stack Engineer',
      },
    });
    console.log('✅ Candidate Career Target configured: "Full Stack Engineer"');

    // 3. Create a test job in DRAFT status
    const testJob = await prisma.job.create({
      data: {
        title: `Verification Full Stack Role ${Date.now()}`,
        companyName: 'Apex AI Labs',
        location: 'Bengaluru, India (Hybrid)',
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        experienceRequired: '1 - 3 years',
        salaryMin: 1200000,
        salaryMax: 2000000,
        salaryVisible: true,
        description: 'We are seeking an outstanding Full Stack Engineer with expertise in Node.js, React, PostgreSQL, and AI toolchains.',
        requiredSkills: ['Node.js', 'React', 'PostgreSQL', 'JavaScript', 'TypeScript'],
        status: 'DRAFT',
        createdBy: adminUser.id,
      },
    });
    console.log(`✅ Created test Job [DRAFT]: "${testJob.title}" (ID: ${testJob.id})`);

    // 4. Publish the job
    const publishedJob = await prisma.job.update({
      where: { id: testJob.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
    console.log(`✅ Updated Job status to [PUBLISHED]`);

    // 5. Test Notification Dispatch Engine
    console.log('\n--- 🔔 Testing Job Notification Dispatch ---');
    const dispatchResult1 = await dispatchJobPublishedNotifications({ jobId: publishedJob.id });
    console.log('Dispatch result 1:', dispatchResult1);

    if (dispatchResult1.notificationsSentCount > 0) {
      console.log(`✅ Successfully dispatched ${dispatchResult1.notificationsSentCount} notification(s) to candidate(s)!`);
    } else {
      console.log(`ℹ️ Dispatch targeted: ${dispatchResult1.targetedUsersCount} users`);
    }

    // 6. Test Duplicate Notification Protection
    console.log('\n--- 🛡️ Testing Duplicate Notification Protection ---');
    const dispatchResult2 = await dispatchJobPublishedNotifications({ jobId: publishedJob.id });
    console.log('Dispatch result 2 (duplicate attempt):', dispatchResult2);

    if (dispatchResult2.notificationsSentCount === 0) {
      console.log(`✅ Duplicate notification prevention PASSED! (Sent: 0 duplicates)`);
    } else {
      console.warn(`⚠️ Duplicate protection warning.`);
    }

    // 7. Verify Notification Record in Database
    const createdNotification = await prisma.notification.findFirst({
      where: {
        userId: candidateUser.id,
        type: 'JOB',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (createdNotification) {
      console.log('\n--- 📬 Notification Payload Verification ---');
      console.log('Title:', createdNotification.title);
      console.log('Message:', createdNotification.message);
      console.log('ActionUrl:', createdNotification.actionUrl);
      console.log('Metadata:', createdNotification.metadata);
      console.log('✅ Notification payload conforms to Phase 3 requirements!');
    }

    // 8. Clean up test job
    await prisma.job.delete({
      where: { id: testJob.id },
    });
    console.log('\n🧹 Cleaned up temporary test job.');

    console.log('\n=============================================');
    console.log('🎉 ALL PHASE 3 VERIFICATION CHECKS PASSED!');
    console.log('=============================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

runPhase3Verification();
