const { getPrismaClient } = require('../config/database');

/**
 * Analytics Service for ElevAI Admin Recruitment Command
 * Strictly computes real metrics from Supabase PostgreSQL database.
 */

/**
 * 1. Overview Summary & Key Metrics
 */
async function getOverviewAnalytics() {
  const prisma = getPrismaClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    adminCount,
    totalResumes,
    totalOptimizations,
    totalInterviews,
    jobCounts,
    applicationCounts,
    newApplicationsLast7d,
    newApplicationsLast30d,
    matchScoreAggregate,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.resume.count(),
    prisma.jobOptimization.count(),
    prisma.interviewSession.count(),
    prisma.job.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.application.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.application.count({
      where: { submittedAt: { gte: sevenDaysAgo } },
    }),
    prisma.application.count({
      where: { submittedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.application.aggregate({
      _avg: { matchScore: true },
      _min: { matchScore: true },
      _max: { matchScore: true },
      where: { matchScore: { not: null } },
    }),
  ]);

  const studentCount = totalUsers - adminCount;

  // Aggregate Job Counts
  const jobsSummary = {
    TOTAL: 0,
    PUBLISHED: 0,
    DRAFT: 0,
    CLOSED: 0,
  };
  jobCounts.forEach((j) => {
    if (jobsSummary[j.status] !== undefined) {
      jobsSummary[j.status] = j._count.id;
    }
    jobsSummary.TOTAL += j._count.id;
  });

  // Aggregate Application Counts
  const appsSummary = {
    TOTAL: 0,
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0,
  };
  applicationCounts.forEach((a) => {
    if (appsSummary[a.status] !== undefined) {
      appsSummary[a.status] = a._count.id;
    }
    appsSummary.TOTAL += a._count.id;
  });

  // Funnel Data (Stages: Total/Submitted -> Under Review -> Shortlisted -> Interview -> Selected)
  const totalApps = appsSummary.TOTAL;
  const funnel = [
    {
      stage: 'Applications Received',
      key: 'TOTAL',
      count: totalApps,
      percentage: 100,
      dropoff: 0,
      color: '#8B5CF6',
    },
    {
      stage: 'Under Review',
      key: 'UNDER_REVIEW',
      count: appsSummary.UNDER_REVIEW + appsSummary.SHORTLISTED + appsSummary.INTERVIEW + appsSummary.SELECTED,
      percentage: totalApps > 0 ? Math.round(((appsSummary.UNDER_REVIEW + appsSummary.SHORTLISTED + appsSummary.INTERVIEW + appsSummary.SELECTED) / totalApps) * 100) : 0,
      color: '#06B6D4',
    },
    {
      stage: 'Shortlisted',
      key: 'SHORTLISTED',
      count: appsSummary.SHORTLISTED + appsSummary.INTERVIEW + appsSummary.SELECTED,
      percentage: totalApps > 0 ? Math.round(((appsSummary.SHORTLISTED + appsSummary.INTERVIEW + appsSummary.SELECTED) / totalApps) * 100) : 0,
      color: '#22D3A7',
    },
    {
      stage: 'Interview Stage',
      key: 'INTERVIEW',
      count: appsSummary.INTERVIEW + appsSummary.SELECTED,
      percentage: totalApps > 0 ? Math.round(((appsSummary.INTERVIEW + appsSummary.SELECTED) / totalApps) * 100) : 0,
      color: '#F59E0B',
    },
    {
      stage: 'Selected / Offer',
      key: 'SELECTED',
      count: appsSummary.SELECTED,
      percentage: totalApps > 0 ? Math.round((appsSummary.SELECTED / totalApps) * 100) : 0,
      color: '#10B981',
    },
  ];

  return {
    system: {
      totalUsers,
      studentCount,
      adminCount,
      totalResumes,
      totalOptimizations,
      totalInterviews,
    },
    jobs: jobsSummary,
    applications: {
      ...appsSummary,
      newLast7Days: newApplicationsLast7d,
      newLast30Days: newApplicationsLast30d,
      averageMatchScore: matchScoreAggregate._avg.matchScore
        ? Math.round(matchScoreAggregate._avg.matchScore)
        : null,
      maxMatchScore: matchScoreAggregate._max.matchScore || null,
      minMatchScore: matchScoreAggregate._min.matchScore || null,
    },
    funnel,
    rejections: {
      count: appsSummary.REJECTED,
      percentage: totalApps > 0 ? Math.round((appsSummary.REJECTED / totalApps) * 100) : 0,
    },
  };
}

/**
 * 2. Application Submission Trends over Time
 * @param {string} range - '7d' | '30d' | '90d' | 'all'
 */
async function getApplicationTrends({ range = '30d' } = {}) {
  const prisma = getPrismaClient();

  const now = new Date();
  let startDate;
  let dayInterval = 1;

  if (range === '7d') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dayInterval = 1;
  } else if (range === '90d') {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    dayInterval = 3;
  } else if (range === 'all') {
    startDate = new Date(0); // Epoch
    dayInterval = 7;
  } else {
    // Default 30d
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dayInterval = 1;
  }

  // Fetch applications within range
  const applications = await prisma.application.findMany({
    where: {
      submittedAt: { gte: startDate },
    },
    select: {
      id: true,
      submittedAt: true,
      status: true,
      matchScore: true,
    },
    orderBy: { submittedAt: 'asc' },
  });

  // Group applications by date (YYYY-MM-DD)
  const dateMap = {};

  // For 7d and 30d, generate continuous daily buckets so empty days have 0
  if (range === '7d' || range === '30d') {
    const days = range === '7d' ? 7 : 30;
    for (let i = days; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      dateMap[key] = {
        date: key,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: 0,
        submitted: 0,
        shortlisted: 0,
        interview: 0,
        selected: 0,
        rejected: 0,
      };
    }
  }

  applications.forEach((app) => {
    const key = new Date(app.submittedAt).toISOString().split('T')[0];
    if (!dateMap[key]) {
      const d = new Date(app.submittedAt);
      dateMap[key] = {
        date: key,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: 0,
        submitted: 0,
        shortlisted: 0,
        interview: 0,
        selected: 0,
        rejected: 0,
      };
    }
    dateMap[key].total += 1;
    if (app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW') dateMap[key].submitted += 1;
    if (app.status === 'SHORTLISTED') dateMap[key].shortlisted += 1;
    if (app.status === 'INTERVIEW') dateMap[key].interview += 1;
    if (app.status === 'SELECTED') dateMap[key].selected += 1;
    if (app.status === 'REJECTED') dateMap[key].rejected += 1;
  });

  const points = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    range,
    totalInRange: applications.length,
    points,
  };
}

/**
 * 3. Job Performance Analytics
 * Returns all jobs with actual application numbers and funnel breakdown per job
 */
async function getJobPerformanceAnalytics({ sortBy = 'applications_desc', status = 'ALL' } = {}) {
  const prisma = getPrismaClient();

  const whereClause = {};
  if (status !== 'ALL') {
    whereClause.status = status.toUpperCase();
  }

  const jobs = await prisma.job.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
      applications: {
        select: {
          id: true,
          status: true,
          matchScore: true,
          submittedAt: true,
        },
      },
    },
  });

  const performanceList = jobs.map((job) => {
    const apps = job.applications || [];
    const totalApps = apps.length;

    const breakdown = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
    };

    let totalMatchScore = 0;
    let scoredAppsCount = 0;

    apps.forEach((a) => {
      if (breakdown[a.status] !== undefined) {
        breakdown[a.status] += 1;
      }
      if (a.matchScore != null) {
        totalMatchScore += a.matchScore;
        scoredAppsCount += 1;
      }
    });

    const averageMatchScore = scoredAppsCount > 0 ? Math.round(totalMatchScore / scoredAppsCount) : null;

    // Check deadline status
    let daysUntilDeadline = null;
    let isDeadlinePassed = false;
    if (job.applicationDeadline) {
      const now = new Date();
      const deadline = new Date(job.applicationDeadline);
      const diffMs = deadline.getTime() - now.getTime();
      daysUntilDeadline = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      isDeadlinePassed = diffMs < 0;
    }

    return {
      id: job.id,
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      workMode: job.workMode,
      employmentType: job.employmentType,
      openings: job.openings,
      status: job.status,
      applicationDeadline: job.applicationDeadline,
      daysUntilDeadline,
      isDeadlinePassed,
      publishedAt: job.publishedAt,
      createdAt: job.createdAt,
      totalApplications: totalApps,
      breakdown,
      averageMatchScore,
      creatorName: job.creator?.name || 'Recruiter',
    };
  });

  // Sort based on sortBy parameter
  if (sortBy === 'applications_desc') {
    performanceList.sort((a, b) => b.totalApplications - a.totalApplications);
  } else if (sortBy === 'applications_asc') {
    performanceList.sort((a, b) => a.totalApplications - b.totalApplications);
  } else if (sortBy === 'match_desc') {
    performanceList.sort((a, b) => (b.averageMatchScore || 0) - (a.averageMatchScore || 0));
  } else if (sortBy === 'deadline_asc') {
    performanceList.sort((a, b) => {
      if (a.daysUntilDeadline === null) return 1;
      if (b.daysUntilDeadline === null) return -1;
      return a.daysUntilDeadline - b.daysUntilDeadline;
    });
  } else if (sortBy === 'newest') {
    performanceList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return {
    totalJobs: performanceList.length,
    jobs: performanceList,
  };
}

/**
 * 4. Skill Demand Analytics
 * Aggregates frequency of required & preferred skills across active PUBLISHED jobs
 */
async function getSkillDemandAnalytics({ limit = 20 } = {}) {
  const prisma = getPrismaClient();

  const publishedJobs = await prisma.job.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      requiredSkills: true,
      preferredSkills: true,
    },
  });

  const totalPublishedJobs = publishedJobs.length;
  const skillFrequency = {};

  publishedJobs.forEach((job) => {
    const req = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
    const pref = Array.isArray(job.preferredSkills) ? job.preferredSkills : [];

    // Count required skills
    req.forEach((rawSkill) => {
      if (typeof rawSkill === 'string' && rawSkill.trim()) {
        const skill = rawSkill.trim();
        if (!skillFrequency[skill]) {
          skillFrequency[skill] = { skill, requiredCount: 0, preferredCount: 0, totalCount: 0 };
        }
        skillFrequency[skill].requiredCount += 1;
        skillFrequency[skill].totalCount += 1;
      }
    });

    // Count preferred skills
    pref.forEach((rawSkill) => {
      if (typeof rawSkill === 'string' && rawSkill.trim()) {
        const skill = rawSkill.trim();
        if (!skillFrequency[skill]) {
          skillFrequency[skill] = { skill, requiredCount: 0, preferredCount: 0, totalCount: 0 };
        }
        skillFrequency[skill].preferredCount += 1;
        skillFrequency[skill].totalCount += 1;
      }
    });
  });

  const sortedSkills = Object.values(skillFrequency)
    .sort((a, b) => b.requiredCount - a.requiredCount || b.totalCount - a.totalCount)
    .slice(0, Math.max(5, Math.min(50, limit)))
    .map((s) => ({
      ...s,
      percentageOfJobs: totalPublishedJobs > 0 ? Math.round((s.requiredCount / totalPublishedJobs) * 100) : 0,
    }));

  return {
    totalPublishedJobs,
    totalUniqueSkills: Object.keys(skillFrequency).length,
    topSkills: sortedSkills,
  };
}

/**
 * 5. Job Deadline Insights
 * Identifies active published jobs approaching deadline
 */
async function getDeadlineInsights() {
  const prisma = getPrismaClient();
  const now = new Date();

  const publishedJobs = await prisma.job.findMany({
    where: {
      status: 'PUBLISHED',
      applicationDeadline: { not: null },
    },
    select: {
      id: true,
      title: true,
      companyName: true,
      location: true,
      workMode: true,
      applicationDeadline: true,
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { applicationDeadline: 'asc' },
  });

  const closingToday = [];
  const closingWithin3Days = [];
  const closingWithin7Days = [];
  const closingWithin14Days = [];
  const expired = [];
  const activeUpcoming = [];

  publishedJobs.forEach((job) => {
    const deadline = new Date(job.applicationDeadline);
    const diffMs = deadline.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const item = {
      id: job.id,
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      workMode: job.workMode,
      applicationDeadline: job.applicationDeadline,
      daysRemaining,
      applicationsCount: job._count.applications,
    };

    if (daysRemaining < 0) {
      expired.push(item);
    } else {
      activeUpcoming.push(item);
      if (daysRemaining === 0) {
        closingToday.push(item);
      } else if (daysRemaining <= 3) {
        closingWithin3Days.push(item);
      } else if (daysRemaining <= 7) {
        closingWithin7Days.push(item);
      } else if (daysRemaining <= 14) {
        closingWithin14Days.push(item);
      }
    }
  });

  return {
    summary: {
      totalWithDeadlines: publishedJobs.length,
      closingToday: closingToday.length,
      closingWithin3Days: closingWithin3Days.length,
      closingWithin7Days: closingWithin7Days.length,
      closingWithin14Days: closingWithin14Days.length,
      expiredCount: expired.length,
    },
    urgentJobs: [...closingToday, ...closingWithin3Days, ...closingWithin7Days],
    allUpcoming: activeUpcoming,
    expiredJobs: expired,
  };
}

/**
 * 6. Factual Recruitment Insights
 * Pure database calculations without fabricated assumptions
 */
async function getRecruitmentInsights() {
  const prisma = getPrismaClient();

  const [
    totalApplications,
    publishedJobs,
    applicationsByStatus,
    zeroAppJobs,
    topApplicantJobs,
  ] = await Promise.all([
    prisma.application.count(),
    prisma.job.count({ where: { status: 'PUBLISHED' } }),
    prisma.application.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.job.count({
      where: {
        status: 'PUBLISHED',
        applications: { none: {} },
      },
    }),
    prisma.job.findMany({
      where: { status: 'PUBLISHED' },
      take: 3,
      orderBy: { applications: { _count: 'desc' } },
      select: {
        id: true,
        title: true,
        companyName: true,
        _count: { select: { applications: true } },
      },
    }),
  ]);

  const statusMap = {};
  applicationsByStatus.forEach((s) => {
    statusMap[s.status] = s._count.id;
  });

  const selectedCount = statusMap.SELECTED || 0;
  const shortlistedCount = (statusMap.SHORTLISTED || 0) + (statusMap.INTERVIEW || 0) + selectedCount;
  const underReviewCount = (statusMap.UNDER_REVIEW || 0) + (statusMap.SUBMITTED || 0);

  const facts = [];

  if (publishedJobs > 0) {
    const avgAppsPerJob = (totalApplications / publishedJobs).toFixed(1);
    facts.push({
      id: 'avg_apps',
      type: 'metric',
      title: 'Application Volume Distribution',
      statement: `Platform has ${publishedJobs} active published jobs receiving an average of ${avgAppsPerJob} candidate applications per job.`,
    });
  }

  if (zeroAppJobs > 0) {
    facts.push({
      id: 'zero_apps',
      type: 'warning',
      title: 'Unfilled Talent Pipelines',
      statement: `${zeroAppJobs} published job requisition${zeroAppJobs > 1 ? 's currently have' : ' currently has'} zero candidate applications.`,
    });
  }

  if (totalApplications > 0) {
    const shortlistRate = Math.round((shortlistedCount / totalApplications) * 100);
    facts.push({
      id: 'shortlist_rate',
      type: 'conversion',
      title: 'Candidate Progression Rate',
      statement: `${shortlistRate}% of all candidate applications (${shortlistedCount} of ${totalApplications}) progressed to shortlisted, interview, or offer stages.`,
    });
  }

  if (underReviewCount > 0) {
    facts.push({
      id: 'pending_action',
      type: 'action',
      title: 'Review Queue Workload',
      statement: `${underReviewCount} candidate application${underReviewCount > 1 ? 's are' : ' is'} currently awaiting recruiter evaluation in the review queue.`,
    });
  }

  return {
    facts,
    topApplicantJobs: topApplicantJobs.map((j) => ({
      id: j.id,
      title: j.title,
      companyName: j.companyName,
      applications: j._count.applications,
    })),
  };
}

module.exports = {
  getOverviewAnalytics,
  getApplicationTrends,
  getJobPerformanceAnalytics,
  getSkillDemandAnalytics,
  getDeadlineInsights,
  getRecruitmentInsights,
};
