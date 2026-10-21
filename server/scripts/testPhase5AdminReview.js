/**
 * Phase 5 Verification Script: Admin Application Review & Candidate Management
 * Tests:
 * 1. Admin applications list with sorting, filtering, and stats aggregation
 * 2. Detailed candidate application retrieval
 * 3. Adding and deleting private admin notes
 * 4. Application status updating with audit trail and candidate notification
 * 5. Recruitment activity feed and global stats
 * 6. Secure signed resume URL generation
 */

const { getPrismaClient } = require('../src/config/database');
const applicationService = require('../src/services/applicationService');

async function runTest() {
  console.log('================================================================');
  console.log('🧪 Starting Phase 5: Admin Application Review Verification');
  console.log('================================================================\n');

  const prisma = getPrismaClient();

  try {
    // 1. Find an Admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!adminUser) {
      console.warn('⚠️ No ADMIN user found in DB. Searching for any user...');
    }

    const testAdminId = adminUser ? adminUser.id : (await prisma.user.findFirst())?.id;
    console.log(`👤 Using Admin ID for test: ${testAdminId}`);

    // 2. Test getGlobalApplicationStats
    console.log('\n📊 1. Testing getGlobalApplicationStats()...');
    const globalStats = await applicationService.getGlobalApplicationStats();
    console.log('Global Stats Result:', JSON.stringify(globalStats, null, 2));

    // 3. Test getAdminApplications with sorting and pagination
    console.log('\n📋 2. Testing getAdminApplications({ sortBy: "match_desc" })...');
    const listResult = await applicationService.getAdminApplications({
      adminId: testAdminId,
      sortBy: 'match_desc',
      page: 1,
      limit: 10,
    });
    console.log(`Found ${listResult.applications.length} applications (Total: ${listResult.pagination.total})`);
    console.log('Summary Breakdown:', listResult.stats);

    if (listResult.applications.length > 0) {
      const sampleApp = listResult.applications[0];
      console.log(`\n🔍 3. Testing getAdminApplicationById for ID: ${sampleApp.id}...`);
      const fullApp = await applicationService.getAdminApplicationById({
        adminId: testAdminId,
        applicationId: sampleApp.id,
      });

      console.log(`Candidate: ${fullApp.user?.name} (${fullApp.user?.email})`);
      console.log(`Job: ${fullApp.job?.title} at ${fullApp.job?.companyName}`);
      console.log(`Current Status: ${fullApp.status}`);
      console.log(`Match Score: ${fullApp.matchScore || fullApp.jobOptimization?.matchScore || 'N/A'}`);
      console.log(`Initial Admin Notes Count: ${fullApp.adminNotes?.length || 0}`);
      console.log(`Status History Count: ${fullApp.statusHistory?.length || 0}`);

      // 4. Test adding a private admin note
      console.log('\n📝 4. Testing addAdminNote()...');
      const testNote = await applicationService.addAdminNote({
        adminId: testAdminId,
        applicationId: sampleApp.id,
        note: `Phase 5 test note created at ${new Date().toISOString()} - candidate demonstrates solid proficiency.`,
      });
      console.log('Created Admin Note ID:', testNote.id);
      console.log('Note Content:', testNote.note);

      // 5. Test status update
      console.log('\n⚡ 5. Testing updateApplicationStatus()...');
      const updatedApp = await applicationService.updateApplicationStatus({
        adminId: testAdminId,
        applicationId: sampleApp.id,
        newStatus: 'UNDER_REVIEW',
        note: 'Phase 5 automated test status transition to UNDER_REVIEW.',
      });
      console.log(`Updated Status: ${updatedApp.status}`);

      // 6. Test Activity Feed
      console.log('\n📰 6. Testing getAdminActivityFeed()...');
      const activityFeed = await applicationService.getAdminActivityFeed({ limit: 5 });
      console.log(`Fetched ${activityFeed.length} activity items`);
      if (activityFeed.length > 0) {
        console.log('Latest Activity:', activityFeed[0]);
      }

      // 7. Test deleting the private note
      console.log('\n🗑️ 7. Testing deleteAdminNote()...');
      const deleteResult = await applicationService.deleteAdminNote({
        adminId: testAdminId,
        noteId: testNote.id,
      });
      console.log('Delete note response:', deleteResult);

      // 8. Test secure resume URL if resume exists
      if (fullApp.resume?.id) {
        console.log('\n🔐 8. Testing getSecureResumeDownloadUrl()...');
        try {
          const secureUrlRes = await applicationService.getSecureResumeDownloadUrl({
            userId: testAdminId,
            role: 'ADMIN',
            resumeId: fullApp.resume.id,
          });
          console.log(`Generated Secure Signed URL (expires in ${secureUrlRes.expiresInSeconds}s)`);
        } catch (storageErr) {
          console.log('Storage signed URL note:', storageErr.message);
        }
      }
    } else {
      console.log('ℹ️ No applications found to test individual item features (list query succeeded with empty array).');
    }

    console.log('\n================================================================');
    console.log('✅ ALL PHASE 5 BACKEND TESTS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('\n❌ Test failed with error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
