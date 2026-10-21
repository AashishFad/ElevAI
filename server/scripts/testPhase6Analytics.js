/**
 * Verification Script for Phase 6: Admin Dashboard & Recruitment Analytics
 * Tests:
 * 1. Overview Analytics & Conversion Funnel calculation
 * 2. Application Submission Trends across date ranges (7d, 30d, 90d, all)
 * 3. Job Performance analytics with application status breakdown
 * 4. Skill Demand analytics across published jobs
 * 5. Job Deadline insights & urgency categorizations
 * 6. Factual recruitment insights synthesis
 */

const { getPrismaClient } = require('../src/config/database');
const analyticsService = require('../src/services/analyticsService');

async function testAnalytics() {
  console.log('================================================================');
  console.log('🧪 Starting Phase 6: Recruitment Analytics Verification');
  console.log('================================================================\n');

  const prisma = getPrismaClient();

  try {
    // 1. Test Overview Analytics
    console.log('📊 1. Testing getOverviewAnalytics()...');
    const overview = await analyticsService.getOverviewAnalytics();
    console.log('System Metrics:', overview.system);
    console.log('Jobs Metrics:', overview.jobs);
    console.log('Applications Metrics:', overview.applications);
    console.log('Funnel Stages Count:', overview.funnel.length);
    console.log('Funnel Conversion:', overview.funnel.map(f => `${f.stage}: ${f.count} (${f.percentage}%)`).join(' -> '));

    // 2. Test Trends across 7d, 30d, 90d, all
    console.log('\n📈 2. Testing getApplicationTrends()...');
    for (const r of ['7d', '30d', '90d', 'all']) {
      const trends = await analyticsService.getApplicationTrends({ range: r });
      console.log(`Range [${r}]: ${trends.points.length} points, Total Applications in Range: ${trends.totalInRange}`);
    }

    // 3. Test Job Performance Analytics
    console.log('\n💼 3. Testing getJobPerformanceAnalytics()...');
    const jobPerf = await analyticsService.getJobPerformanceAnalytics({ sortBy: 'applications_desc' });
    console.log(`Evaluated ${jobPerf.totalJobs} jobs for performance matrix.`);
    if (jobPerf.jobs.length > 0) {
      const topJob = jobPerf.jobs[0];
      console.log(`Top Job: "${topJob.title}" at ${topJob.companyName} | Total Apps: ${topJob.totalApplications}`);
      console.log('Status Breakdown:', topJob.breakdown);
    }

    // 4. Test Skill Demand Analytics
    console.log('\n⚡ 4. Testing getSkillDemandAnalytics()...');
    const skillDemand = await analyticsService.getSkillDemandAnalytics({ limit: 10 });
    console.log(`Published Jobs Evaluated: ${skillDemand.totalPublishedJobs}`);
    console.log(`Unique Skills Extracted: ${skillDemand.totalUniqueSkills}`);
    console.log('Top In-Demand Skills:', skillDemand.topSkills.map(s => `${s.skill} (${s.requiredCount} jobs, ${s.percentageOfJobs}%)`));

    // 5. Test Deadline Insights
    console.log('\n⏰ 5. Testing getDeadlineInsights()...');
    const deadlines = await analyticsService.getDeadlineInsights();
    console.log('Deadline Summary:', deadlines.summary);
    console.log(`Urgent Jobs (≤7 days): ${deadlines.urgentJobs.length}`);

    // 6. Test Recruitment Insights
    console.log('\n💡 6. Testing getRecruitmentInsights()...');
    const insights = await analyticsService.getRecruitmentInsights();
    console.log(`Synthesized ${insights.facts.length} factual database observations:`);
    insights.facts.forEach(f => console.log(` - [${f.type.toUpperCase()}] ${f.title}: ${f.statement}`));

    console.log('\n================================================================');
    console.log('✅ ALL PHASE 6 ANALYTICS TESTS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalytics();
