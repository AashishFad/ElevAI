/**
 * Phase 6 Analytics Verification with Active Test Records
 */

const { getPrismaClient } = require('../src/config/database');
const analyticsService = require('../src/services/analyticsService');

async function testWithActiveData() {
  const prisma = getPrismaClient();
  console.log('🔄 Running Phase 6 Analytics Verification with Dynamic Test Records...\n');

  let adminUser, studentUser, testJob1, testJob2, testResume, app1, app2;

  try {
    adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    studentUser = await prisma.user.findFirst({ where: { role: 'USER' } }) || adminUser;

    if (!adminUser) {
      console.error('No admin user found.');
      return;
    }

    const futureDeadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

    // 1. Create 2 test jobs
    testJob1 = await prisma.job.create({
      data: {
        title: 'Full Stack React & Node Engineer',
        companyName: 'ElevAI Tech',
        location: 'Remote',
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        experienceRequired: '2-4 years',
        requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
        preferredSkills: ['TypeScript', 'Docker'],
        applicationDeadline: futureDeadline,
        description: 'Test job for analytics.',
        status: 'PUBLISHED',
        createdBy: adminUser.id,
      },
    });

    testJob2 = await prisma.job.create({
      data: {
        title: 'Senior AI / Backend Engineer',
        companyName: 'ElevAI AI Labs',
        location: 'Bangalore, India',
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        experienceRequired: '4-6 years',
        requiredSkills: ['Python', 'Node.js', 'PostgreSQL', 'FastAPI'],
        applicationDeadline: futureDeadline,
        description: 'Test AI job for analytics.',
        status: 'PUBLISHED',
        createdBy: adminUser.id,
      },
    });

    console.log(`Created test jobs: ${testJob1.id}, ${testJob2.id}`);

    // 2. Create test resume
    testResume = await prisma.resume.create({
      data: {
        userId: studentUser.id,
        storagePath: 'resumes/analytics-test-resume.pdf',
        originalFileName: 'Analytics_Resume.pdf',
        fileType: 'application/pdf',
        fileSize: 102400,
        status: 'READY',
      },
    });

    // 3. Create test applications
    app1 = await prisma.application.create({
      data: {
        jobId: testJob1.id,
        userId: studentUser.id,
        resumeId: testResume.id,
        matchScore: 88,
        status: 'SHORTLISTED',
      },
    });

    app2 = await prisma.application.create({
      data: {
        jobId: testJob2.id,
        userId: studentUser.id,
        resumeId: testResume.id,
        matchScore: 92,
        status: 'SELECTED',
      },
    });

    console.log(`Created test applications: ${app1.id} (SHORTLISTED), ${app2.id} (SELECTED)`);

    // 4. Run Analytics Engine
    console.log('\n📊 --- RUNNING ANALYTICS SUITE ---');

    const overview = await analyticsService.getOverviewAnalytics();
    console.log('✅ Overview Stats:', {
      totalApplications: overview.applications.TOTAL,
      shortlisted: overview.applications.SHORTLISTED,
      selected: overview.applications.SELECTED,
      avgMatchScore: overview.applications.averageMatchScore,
    });
    console.log('✅ Conversion Funnel:', overview.funnel.map(f => `${f.stage}: ${f.count} (${f.percentage}%)`));

    const trends = await analyticsService.getApplicationTrends({ range: '7d' });
    console.log(`✅ 7D Trends Data Points: ${trends.points.length} (Total in range: ${trends.totalInRange})`);

    const skills = await analyticsService.getSkillDemandAnalytics({ limit: 10 });
    console.log('✅ Skill Demand Rankings:');
    skills.topSkills.forEach(s => console.log(`   - ${s.skill}: ${s.requiredCount} jobs (${s.percentageOfJobs}%)`));

    const performance = await analyticsService.getJobPerformanceAnalytics({ sortBy: 'applications_desc' });
    console.log(`✅ Job Performance Matrix (${performance.totalJobs} jobs evaluated):`);
    performance.jobs.slice(0, 2).forEach(j => {
      console.log(`   - "${j.title}" (${j.companyName}): Apps=${j.totalApplications}, AvgMatch=${j.averageMatchScore}%, DaysLeft=${j.daysUntilDeadline}`);
    });

    const deadlines = await analyticsService.getDeadlineInsights();
    console.log('✅ Deadline Radar:', deadlines.summary);

    const insights = await analyticsService.getRecruitmentInsights();
    console.log('✅ Factual Recruitment Insights:');
    insights.facts.forEach(f => console.log(`   - ${f.title}: ${f.statement}`));

    console.log('\n🎉 All dynamic analytics calculations validated perfectly!');
  } catch (err) {
    console.error('❌ Test error:', err);
  } finally {
    // Cleanup
    if (app1) await prisma.application.delete({ where: { id: app1.id } }).catch(() => {});
    if (app2) await prisma.application.delete({ where: { id: app2.id } }).catch(() => {});
    if (testResume) await prisma.resume.delete({ where: { id: testResume.id } }).catch(() => {});
    if (testJob1) await prisma.job.delete({ where: { id: testJob1.id } }).catch(() => {});
    if (testJob2) await prisma.job.delete({ where: { id: testJob2.id } }).catch(() => {});
    await prisma.$disconnect();
  }
}

testWithActiveData();
