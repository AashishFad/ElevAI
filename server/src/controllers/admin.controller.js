const { getPrismaClient } = require('../config/database');

/**
 * Admin Controller for ElevAI Phase 1 RBAC & Overview
 */

async function getOverview(req, res, next) {
  try {
    const prisma = getPrismaClient();

    // 1. Fetch real system telemetry
    const [
      totalUsers,
      totalResumes,
      totalAnalyses,
      totalInterviews,
      totalJobs,
      publishedJobs,
      draftJobs,
      totalApplications,
      pendingReviews,
      shortlistedApplications,
      selectedApplications,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.resumeAnalysis.count(),
      prisma.interviewSession.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'PUBLISHED' } }),
      prisma.job.count({ where: { status: 'DRAFT' } }),
      prisma.application.count(),
      prisma.application.count({
        where: {
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        },
      }),
      prisma.application.count({
        where: {
          status: { in: ['SHORTLISTED', 'INTERVIEW'] },
        },
      }),
      prisma.application.count({
        where: {
          status: 'SELECTED',
        },
      }),
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              resumes: true,
              interviews: true,
              jobOptimizations: true,
              applications: true,
            },
          },
        },
      }),
    ]);

    // 2. Count admin vs user breakdown
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const studentCount = totalUsers - adminCount;

    res.status(200).json({
      success: true,
      data: {
        system: {
          totalUsers,
          studentCount,
          adminCount,
          totalResumes,
          totalAnalyses,
          totalInterviews,
          totalJobs,
          publishedJobs,
          draftJobs,
        },
        recruitment: {
          activeJobs: publishedJobs,
          totalJobs,
          draftJobs,
          totalApplications,
          pendingReviews,
          shortlisted: shortlistedApplications,
          selected: selectedApplications,
          status: 'recruitment_os_active',
          message: 'Full candidate review pipeline is active.',
        },
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const search = (req.query.search || '').trim();

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              resumes: true,
              interviews: true,
              jobOptimizations: true,
            },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  listUsers,
};
