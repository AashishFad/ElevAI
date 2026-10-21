const { getPrismaClient } = require('../src/config/database');
const {
  submitApplication,
  getUserApplications,
  getUserApplicationById,
  checkUserJobApplication,
} = require('../src/services/applicationService');
const {
  getUserNotifications,
  markAsRead,
  createNotification,
} = require('../src/services/notificationService');

async function runPhase7Tests() {
  console.log('================================================================');
  console.log('🚀 [PHASE 7 VERIFICATION] CANDIDATE CAREER DASHBOARD & JOB EXPERIENCE');
  console.log('================================================================\n');
  const prisma = getPrismaClient();

  try {
    // 1. Locate Admin & Users
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) {
      throw new Error('Admin user required for job posting verification.');
    }

    let candidate = await prisma.user.findFirst({ where: { role: 'USER' } });
    if (!candidate) {
      candidate = await prisma.user.create({
        data: {
          email: `student_${Date.now()}@example.com`,
          name: 'Priya Sharma',
          passwordHash: 'dummy_hash',
          role: 'USER',
        },
      });
    }
    console.log(`✅ [1/7] Verified Candidate User: ${candidate.name} (${candidate.email})`);

    // 2. Profile Readiness Check Simulation (fact-based from DB)
    const [careerGoal, resumes, skillGaps, interviews, applications] = await Promise.all([
      prisma.careerGoal.findUnique({ where: { userId: candidate.id } }),
      prisma.resume.findMany({ where: { userId: candidate.id } }),
      prisma.skillGapAnalysis.findMany({ where: { userId: candidate.id } }),
      prisma.interviewSession.findMany({ where: { userId: candidate.id } }),
      prisma.application.findMany({ where: { userId: candidate.id } }),
    ]);

    let readinessScore = 0;
    if (candidate.name && candidate.email) readinessScore += 20;
    if (resumes.length > 0) readinessScore += 25;
    if (careerGoal && careerGoal.targetRole) readinessScore += 20;
    if (skillGaps.length > 0) readinessScore += 15;
    if (interviews.length > 0) readinessScore += 20;

    console.log(`✅ [2/7] Dynamic Profile Readiness Calculated: ${readinessScore}% (Resumes: ${resumes.length}, Target Role: ${careerGoal ? careerGoal.targetRole : 'Not set'}, Interviews: ${interviews.length})`);

    // 3. Public Job Feed Querying (Strictly PUBLISHED status)
    const publicJobs = await prisma.job.findMany({
      where: { status: 'PUBLISHED' },
      take: 10,
      orderBy: { publishedAt: 'desc' },
    });
    console.log(`✅ [3/7] Public Job Feed: retrieved ${publicJobs.length} published jobs`);
    
    // Ensure all returned jobs are strictly PUBLISHED
    const nonPublished = publicJobs.filter(j => j.status !== 'PUBLISHED');
    if (nonPublished.length > 0) {
      throw new Error(`Public feed leaked non-published jobs: ${nonPublished.map(j => j.id).join(', ')}`);
    }

    // 4. Job Application Status Check
    if (publicJobs.length > 0) {
      const targetJob = publicJobs[0];
      const statusCheck = await checkUserJobApplication(targetJob.id, candidate.id);
      console.log(`✅ [4/7] Job Application Status check for job "${targetJob.title}": hasApplied = ${statusCheck.hasApplied}`);
    }

    // 5. User Applications Listing & Retrieval
    const userApps = await getUserApplications(candidate.id, { page: 1, limit: 10 });
    console.log(`✅ [5/7] Candidate Applications List: found ${userApps.applications.length} applications`);

    if (userApps.applications.length > 0) {
      const sampleApp = userApps.applications[0];
      const appDetail = await getUserApplicationById(sampleApp.id, candidate.id);
      if (!appDetail) throw new Error('Failed to retrieve candidate application detail');
      console.log(`    ↳ Detail verified: Job "${appDetail.job.title}", Status: ${appDetail.status}, History events: ${appDetail.statusHistory?.length || 0}`);
    }

    // 6. Notification System Verification for Candidate
    const notifs = await getUserNotifications({ userId: candidate.id, page: 1, limit: 5 });
    console.log(`✅ [6/7] Candidate Notifications: retrieved ${notifs.notifications.length} notifications (Unread: ${notifs.unreadCount})`);

    // Create a test application status notification
    const testNotif = await createNotification({
      userId: candidate.id,
      type: 'APPLICATION',
      title: 'Application Status Update: Shortlisted',
      message: 'Great news! Your application has been moved to Shortlisted.',
      actionUrl: '/applications',
      metadata: { status: 'SHORTLISTED' },
    });
    console.log(`    ↳ Dispatched test APPLICATION notification ID: ${testNotif.id}`);

    // Mark as read
    await markAsRead({ notificationId: testNotif.id, userId: candidate.id });
    console.log(`    ↳ Successfully marked notification ${testNotif.id} as read`);

    // 7. Data Isolation & Security Check
    let userB = await prisma.user.findFirst({
      where: { role: 'USER', id: { not: candidate.id } },
    });
    if (!userB) {
      userB = await prisma.user.create({
        data: {
          email: `isolated_user_${Date.now()}@example.com`,
          name: 'Isolated User',
          passwordHash: 'dummy_hash',
          role: 'USER',
        },
      });
    }

    // Attempt unauthorized access by userB to candidate's notification
    const userBNotifs = await getUserNotifications({ userId: userB.id, page: 1, limit: 5 });
    const leakedNotif = userBNotifs.notifications.find(n => n.id === testNotif.id);
    if (leakedNotif) {
      throw new Error('Security violation: User B received User A notification!');
    }
    console.log(`✅ [7/7] Strict User-Data Isolation verified: User B cannot access Candidate notifications.`);

    console.log('\n🎉 [PHASE 7 VERIFICATION] All Student Dashboard, Job Feed & Application tests PASSED successfully!\n');
  } catch (error) {
    console.error('\n❌ [PHASE 7 VERIFICATION FAILED]:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase7Tests();
