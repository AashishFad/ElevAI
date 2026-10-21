/**
 * Comprehensive Lifecycle Test for Phase 5:
 * Creates a mock test job, resume, and application to thoroughly test:
 * - Application detail dossier fetching
 * - Private admin notes addition & deletion
 * - Status transition with audit trail & notification
 * - Live activity feed generation
 * - Cleans up test artifacts
 */

const { getPrismaClient } = require('../src/config/database');
const applicationService = require('../src/services/applicationService');

async function testFullLifecycle() {
  const prisma = getPrismaClient();
  console.log('🔄 Running Complete Phase 5 Lifecycle Test...\n');

  let testUser, testJob, testResume, testApp;

  try {
    // 1. Get or create test users
    testUser = await prisma.user.findFirst({ where: { role: 'USER' } }) || await prisma.user.findFirst();
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } }) || testUser;

    if (!testUser) {
      console.error('No users found in database.');
      return;
    }

    // 2. Create a test job
    testJob = await prisma.job.create({
      data: {
        title: 'Senior AI Engineer (Lifecycle Test)',
        companyName: 'ElevAI Labs',
        location: 'Remote',
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        experienceRequired: '3-5 years',
        requiredSkills: ['Node.js', 'React', 'PostgreSQL', 'AI/ML'],
        description: 'Testing recruitment workflow lifecycle.',
        status: 'PUBLISHED',
        createdBy: adminUser.id,
      },
    });
    console.log('Created test job:', testJob.id);

    // 3. Create a test resume
    testResume = await prisma.resume.create({
      data: {
        userId: testUser.id,
        storagePath: 'resumes/test-resume.pdf',
        originalFileName: 'Candidate_Resume_Test.pdf',
        fileType: 'application/pdf',
        fileSize: 102400,
        extractedText: 'Full Stack Engineer with 4 years experience in Node.js, React, and PostgreSQL.',
        status: 'READY',
      },
    });
    console.log('Created test resume:', testResume.id);

    // 4. Submit test application
    testApp = await applicationService.submitApplication({
      userId: testUser.id,
      jobId: testJob.id,
      resumeId: testResume.id,
      coverLetter: 'Excited to apply for this AI engineering position!',
    });
    console.log('Created test application:', testApp.id);

    // 5. Test getAdminApplicationById
    const dossier = await applicationService.getAdminApplicationById({
      adminId: adminUser.id,
      applicationId: testApp.id,
    });
    console.log('✅ Retrieved application dossier for:', dossier.user.name);

    // 6. Test Add Admin Note
    const note = await applicationService.addAdminNote({
      adminId: adminUser.id,
      applicationId: testApp.id,
      note: 'Candidate shows exceptional full-stack knowledge in resume review.',
    });
    console.log('✅ Created private admin note:', note.id);

    // 7. Test Update Application Status to SHORTLISTED
    const updated = await applicationService.updateApplicationStatus({
      adminId: adminUser.id,
      applicationId: testApp.id,
      newStatus: 'SHORTLISTED',
      note: 'Shortlisted candidate for technical panel interview.',
    });
    console.log('✅ Updated status to:', updated.status);

    // 8. Test Activity Feed
    const feed = await applicationService.getAdminActivityFeed({ limit: 5 });
    console.log('✅ Latest activity feed entry:', feed[0]?.note);

    // 9. Test Delete Admin Note
    await applicationService.deleteAdminNote({
      adminId: adminUser.id,
      noteId: note.id,
    });
    console.log('✅ Deleted private admin note');

    console.log('\n🎉 Complete Phase 5 recruitment workflow verified successfully!');
  } catch (err) {
    console.error('❌ Lifecycle test error:', err);
  } finally {
    // Cleanup test records
    if (testApp) {
      await prisma.applicationStatusHistory.deleteMany({ where: { applicationId: testApp.id } }).catch(() => {});
      await prisma.applicationNote.deleteMany({ where: { applicationId: testApp.id } }).catch(() => {});
      await prisma.application.delete({ where: { id: testApp.id } }).catch(() => {});
    }
    if (testResume) {
      await prisma.resume.delete({ where: { id: testResume.id } }).catch(() => {});
    }
    if (testJob) {
      await prisma.job.delete({ where: { id: testJob.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }
}

testFullLifecycle();
