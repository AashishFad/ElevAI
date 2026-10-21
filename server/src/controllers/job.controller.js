const { getPrismaClient } = require('../config/database');
const { validateJobInput, VALID_STATUSES } = require('../validators/job.validator');
const { dispatchJobPublishedNotifications } = require('../services/jobNotificationService');

/**
 * Job Controller for ElevAI Admin Recruitment & User Job Feed
 */

// 1. Create a new Job (Draft or Published)
async function createJob(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateJobInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
        errors,
      });
    }

    const prisma = getPrismaClient();
    const createdBy = req.user.userId;
    const isPublished = sanitized.status === 'PUBLISHED';

    const jobData = {
      ...sanitized,
      createdBy,
      status: sanitized.status || 'DRAFT',
      publishedAt: isPublished ? new Date() : null,
    };

    const newJob = await prisma.job.create({
      data: jobData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If created directly as PUBLISHED, trigger candidate notification dispatch
    let notificationStats = null;
    if (isPublished) {
      dispatchJobPublishedNotifications({ jobId: newJob.id })
        .then((stats) => {
          notificationStats = stats;
        })
        .catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: isPublished
        ? 'Job published successfully and relevant candidates notified'
        : 'Job saved as draft successfully',
      job: newJob,
      notificationStats,
    });
  } catch (error) {
    next(error);
  }
}

// 2. Get all jobs for Admin (with filtering, search, pagination)
async function getAdminJobs(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const {
      status,
      search,
      workMode,
      employmentType,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (status && status !== 'ALL' && VALID_STATUSES.includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    if (search && search.trim().length > 0) {
      const s = search.trim();
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { companyName: { contains: s, mode: 'insensitive' } },
        { location: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (workMode && workMode !== 'ALL') {
      where.workMode = workMode.toUpperCase();
    }

    if (employmentType && employmentType !== 'ALL') {
      where.employmentType = employmentType.toUpperCase();
    }

    const [total, draftCount, publishedCount, closedCount, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.count({ where: { status: 'DRAFT' } }),
      prisma.job.count({ where: { status: 'PUBLISHED' } }),
      prisma.job.count({ where: { status: 'CLOSED' } }),
      prisma.job.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        counts: {
          total: draftCount + publishedCount + closedCount,
          draft: draftCount,
          published: publishedCount,
          closed: closedCount,
        },
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// 3. Get single Job by ID (Admin)
async function getAdminJobById(req, res, next) {
  try {
    const { id } = req.params;
    const prisma = getPrismaClient();

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job opportunity not found',
      });
    }

    // Fetch real notification dispatch count for this job
    const notificationsCount = await prisma.notification.count({
      where: {
        type: 'JOB',
        metadata: {
          path: ['jobId'],
          equals: job.id,
        },
      },
    });

    res.status(200).json({
      success: true,
      job: {
        ...job,
        notificationsSentCount: notificationsCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

// 4. Update Job by ID (Admin)
async function updateJob(req, res, next) {
  try {
    const { id } = req.params;
    const prisma = getPrismaClient();

    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job opportunity not found',
      });
    }

    const { isValid, errors, sanitized } = validateJobInput(req.body, true);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
        errors,
      });
    }

    const updateData = { ...sanitized };
    let newlyPublished = false;

    // Handle status transitions
    if (sanitized.status) {
      if (sanitized.status === 'PUBLISHED' && existingJob.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date();
        newlyPublished = true;
      } else if (sanitized.status === 'CLOSED' && existingJob.status !== 'CLOSED') {
        updateData.closedAt = new Date();
      }
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If transitioned into PUBLISHED status, dispatch notifications
    if (newlyPublished) {
      dispatchJobPublishedNotifications({ jobId: updatedJob.id }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
}

// 5. Update Job Status (DRAFT | PUBLISHED | CLOSED)
async function updateJobStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(String(status).toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const prisma = getPrismaClient();
    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job opportunity not found',
      });
    }

    const targetStatus = String(status).toUpperCase();
    const updateData = { status: targetStatus };
    let newlyPublished = false;

    if (targetStatus === 'PUBLISHED' && existingJob.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
      newlyPublished = true;
    } else if (targetStatus === 'CLOSED' && existingJob.status !== 'CLOSED') {
      updateData.closedAt = new Date();
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (newlyPublished) {
      dispatchJobPublishedNotifications({ jobId: updatedJob.id }).catch(() => {});
    }

    let actionMsg = 'Job status updated';
    if (targetStatus === 'PUBLISHED') actionMsg = 'Job published successfully & relevant students notified';
    if (targetStatus === 'CLOSED') actionMsg = 'Job closed successfully';
    if (targetStatus === 'DRAFT') actionMsg = 'Job moved to drafts';

    res.status(200).json({
      success: true,
      message: actionMsg,
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
}

// 6. Delete Job (Admin)
async function deleteJob(req, res, next) {
  try {
    const { id } = req.params;
    const prisma = getPrismaClient();

    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job opportunity not found',
      });
    }

    await prisma.job.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    next(error);
  }
}

// 7. Get Public / Student Published Jobs (Feed)
// Normal users can ONLY see published jobs
async function getPublishedJobs(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { search, workMode, employmentType, experience, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      status: 'PUBLISHED',
    };

    if (search && search.trim().length > 0) {
      const s = search.trim();
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { companyName: { contains: s, mode: 'insensitive' } },
        { location: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (workMode && workMode !== 'ALL') {
      where.workMode = workMode.toUpperCase();
    }

    if (employmentType && employmentType !== 'ALL') {
      where.employmentType = employmentType.toUpperCase();
    }

    if (experience && experience.trim().length > 0) {
      where.experienceRequired = { contains: experience.trim(), mode: 'insensitive' };
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          companyName: true,
          location: true,
          workMode: true,
          employmentType: true,
          experienceRequired: true,
          educationRequirement: true,
          requiredSkills: true,
          preferredSkills: true,
          salaryMin: true,
          salaryMax: true,
          salaryVisible: true,
          description: true,
          openings: true,
          applicationDeadline: true,
          publishedAt: true,
          createdAt: true,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

// 8. Get Single Published Job by ID (Student / Public View)
async function getPublicJobById(req, res, next) {
  try {
    const { id } = req.params;
    const prisma = getPrismaClient();

    const job = await prisma.job.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        companyName: true,
        location: true,
        workMode: true,
        employmentType: true,
        experienceRequired: true,
        educationRequirement: true,
        requiredSkills: true,
        preferredSkills: true,
        salaryMin: true,
        salaryMax: true,
        salaryVisible: true,
        description: true,
        openings: true,
        applicationDeadline: true,
        status: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        isAvailable: false,
        message: 'This job opportunity is no longer available.',
      });
    }

    // If job is not PUBLISHED, normal students should receive an informative inactive message
    if (job.status !== 'PUBLISHED') {
      return res.status(410).json({
        success: false,
        isAvailable: false,
        message: 'This job requisition has been closed or unlisted by the recruiter.',
      });
    }

    res.status(200).json({
      success: true,
      isAvailable: true,
      job,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createJob,
  getAdminJobs,
  getAdminJobById,
  updateJob,
  updateJobStatus,
  deleteJob,
  getPublishedJobs,
  getPublicJobById,
};
