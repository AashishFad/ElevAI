const { getPrismaClient } = require('../config/database');
const { createNotification } = require('./notificationService');
const { getSignedDownloadUrl } = require('./storageService');

const VALID_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'REJECTED',
  'INTERVIEW',
  'SELECTED',
];

const STATUS_LABELS = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  REJECTED: 'Rejected',
  INTERVIEW: 'Interview',
  SELECTED: 'Selected',
};

/**
 * Submit candidate job application
 */
async function submitApplication({
  userId,
  jobId,
  resumeId,
  jobOptimizationId,
  coverLetter,
}) {
  const prisma = getPrismaClient();

  if (!jobId) {
    throw { statusCode: 400, message: 'Job ID is required to submit an application.' };
  }

  if (!resumeId) {
    throw { statusCode: 400, message: 'Please select a valid resume to submit.' };
  }

  // 1. Verify authenticated User
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw { statusCode: 401, message: 'Authenticated user profile not found.' };
  }

  // 2. Verify Job exists and is active/published
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      companyName: true,
      location: true,
      status: true,
      applicationDeadline: true,
      createdBy: true,
    },
  });

  if (!job) {
    throw { statusCode: 404, message: 'The requested job posting was not found.' };
  }

  if (job.status !== 'PUBLISHED') {
    throw {
      statusCode: 400,
      message: `This job is not accepting applications. Current status is ${job.status.toLowerCase()}.`,
    };
  }

  if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
    throw {
      statusCode: 400,
      message: 'The application deadline for this job opportunity has passed.',
    };
  }

  // 3. Verify Resume ownership & status
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
  });

  if (!resume) {
    throw {
      statusCode: 403,
      message: 'The selected resume does not exist or does not belong to your account.',
    };
  }

  if (resume.status !== 'READY') {
    throw {
      statusCode: 400,
      message: `Selected resume cannot be submitted (current status: ${resume.status}). Please choose a parsed and ready resume.`,
    };
  }

  // 4. Prevent duplicate applications
  const existingApplication = await prisma.application.findUnique({
    where: {
      jobId_userId: {
        jobId,
        userId,
      },
    },
  });

  if (existingApplication) {
    throw {
      statusCode: 409,
      message: 'You have already applied for this job opportunity.',
      applicationId: existingApplication.id,
    };
  }

  // 5. Verify & link JobOptimization if provided
  let matchScore = null;
  let validJobOptimizationId = null;

  if (jobOptimizationId) {
    const optimization = await prisma.jobOptimization.findFirst({
      where: {
        id: jobOptimizationId,
        userId,
      },
    });

    if (optimization) {
      matchScore = optimization.matchScore;
      validJobOptimizationId = optimization.id;
    }
  }

  // If no jobOptimizationId provided, check if user ran an optimization for this resume & job title
  if (!validJobOptimizationId) {
    const recentOptimization = await prisma.jobOptimization.findFirst({
      where: {
        userId,
        resumeId: resume.id,
        OR: [
          { jobTitle: { contains: job.title, mode: 'insensitive' } },
          { companyName: { contains: job.companyName, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOptimization) {
      matchScore = recentOptimization.matchScore;
      validJobOptimizationId = recentOptimization.id;
    }
  }

  // 6. Create Application record and initial status history in a transaction
  const application = await prisma.$transaction(async (tx) => {
    const createdApp = await tx.application.create({
      data: {
        jobId: job.id,
        userId,
        resumeId: resume.id,
        jobOptimizationId: validJobOptimizationId,
        matchScore,
        status: 'SUBMITTED',
        coverLetter: coverLetter ? coverLetter.trim() : null,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
            workMode: true,
            employmentType: true,
          },
        },
        resume: {
          select: {
            id: true,
            originalFileName: true,
            fileType: true,
            fileSize: true,
            createdAt: true,
          },
        },
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: createdApp.id,
        oldStatus: null,
        newStatus: 'SUBMITTED',
        changedById: userId,
        note: 'Application submitted by candidate.',
      },
    });

    return createdApp;
  }, { timeout: 20000, maxWait: 10000 });

  // 7. Trigger In-App Notifications
  // A) Candidate confirmation notification
  await createNotification({
    userId,
    type: 'APPLICATION',
    title: `Application Submitted: ${job.title}`,
    message: `Your application for "${job.title}" at ${job.companyName} has been received. Track your status in My Applications.`,
    actionUrl: `/applications/${application.id}`,
    metadata: { applicationId: application.id, jobId: job.id },
  }).catch((err) => console.error('[Notification Error Candidate]:', err.message));

  // B) Admin notification to the job creator or all Admins
  const adminsToNotify = await prisma.user.findMany({
    where: {
      OR: [
        { id: job.createdBy },
        { role: 'ADMIN' },
      ],
    },
    select: { id: true },
    take: 5,
  });

  for (const admin of adminsToNotify) {
    if (admin.id !== userId) {
      await createNotification({
        userId: admin.id,
        type: 'APPLICATION',
        title: `New Candidate Application: ${user.name}`,
        message: `${user.name} applied for "${job.title}" at ${job.companyName}.${matchScore ? ` AI Match Score: ${matchScore}%.` : ''}`,
        actionUrl: `/admin/applications/${application.id}`,
        metadata: { applicationId: application.id, jobId: job.id },
      }).catch((err) => console.error('[Notification Error Admin]:', err.message));
    }
  }

  return application;
}

/**
 * Get current user's submitted applications
 */
async function getUserApplications(arg1, arg2) {
  let userId, page = 1, limit = 20, status;
  if (typeof arg1 === 'object' && arg1 !== null) {
    userId = arg1.userId;
    page = arg1.page || 1;
    limit = arg1.limit || 20;
    status = arg1.status;
  } else {
    userId = arg1;
    const opts = arg2 || {};
    page = opts.page || 1;
    limit = opts.limit || 20;
    status = opts.status;
  }

  const prisma = getPrismaClient();

  const take = Math.max(1, Math.min(50, Number(limit) || 20));
  const skip = (Math.max(1, Number(page) || 1) - 1) * take;

  const whereClause = {
    userId,
    ...(status && VALID_STATUSES.includes(status.toUpperCase())
      ? { status: status.toUpperCase() }
      : {}),
  };

  const [total, applications] = await Promise.all([
    prisma.application.count({ where: whereClause }),
    prisma.application.findMany({
      where: whereClause,
      take,
      skip,
      orderBy: { submittedAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
            workMode: true,
            employmentType: true,
            status: true,
          },
        },
        resume: {
          select: {
            id: true,
            originalFileName: true,
            fileType: true,
            fileSize: true,
          },
        },
        jobOptimization: {
          select: {
            id: true,
            matchScore: true,
          },
        },
      },
    }),
  ]);

  return {
    applications,
    pagination: {
      total,
      page: Number(page) || 1,
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}

/**
 * Get single application by ID for user
 */
async function getUserApplicationById(arg1, arg2) {
  let userId, applicationId;
  if (typeof arg1 === 'object' && arg1 !== null) {
    userId = arg1.userId;
    applicationId = arg1.applicationId;
  } else {
    applicationId = arg1;
    userId = arg2;
  }

  const prisma = getPrismaClient();

  if (!applicationId) {
    throw { statusCode: 400, message: 'Application ID is required.' };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true,
      resume: {
        select: {
          id: true,
          originalFileName: true,
          fileType: true,
          fileSize: true,
          createdAt: true,
        },
      },
      jobOptimization: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        include: {
          changedBy: {
            select: { id: true, name: true, role: true },
          },
        },
      },
    },
  });

  if (!application) {
    throw { statusCode: 404, message: 'Application not found.' };
  }

  if (userId && application.userId !== userId) {
    throw { statusCode: 403, message: 'You do not have permission to view this application.' };
  }

  return application;
}

/**
 * Check if candidate has already applied for a specific job
 */
async function checkUserJobApplication({ userId, jobId }) {
  const prisma = getPrismaClient();

  if (!userId || !jobId) {
    return {
      hasApplied: false,
      application: null,
    };
  }

  const existing = await prisma.application.findUnique({
    where: {
      jobId_userId: {
        jobId,
        userId,
      },
    },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      matchScore: true,
    },
  });

  return {
    hasApplied: Boolean(existing),
    application: existing || null,
  };
}

/**
 * Get all applications for Admin view with sorting and statistics
 */
async function getAdminApplications({
  adminId,
  jobId,
  status,
  search,
  sortBy = 'newest',
  page = 1,
  limit = 20,
}) {
  const prisma = getPrismaClient();

  const take = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (Math.max(1, Number(page) || 1) - 1) * take;

  const whereClause = {
    ...(jobId ? { jobId } : {}),
    ...(status && VALID_STATUSES.includes(status.toUpperCase())
      ? { status: status.toUpperCase() }
      : {}),
    ...(search && search.trim()
      ? {
          OR: [
            { user: { name: { contains: search.trim(), mode: 'insensitive' } } },
            { user: { email: { contains: search.trim(), mode: 'insensitive' } } },
            { job: { title: { contains: search.trim(), mode: 'insensitive' } } },
            { job: { companyName: { contains: search.trim(), mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  // Configure orderBy based on sortBy parameter
  let orderBy = { submittedAt: 'desc' };
  if (sortBy === 'oldest') {
    orderBy = { submittedAt: 'asc' };
  } else if (sortBy === 'match_desc') {
    orderBy = { matchScore: 'desc' };
  } else if (sortBy === 'match_asc') {
    orderBy = { matchScore: 'asc' };
  } else if (sortBy === 'status') {
    orderBy = { status: 'asc' };
  }

  const [total, applications, globalStats] = await Promise.all([
    prisma.application.count({ where: whereClause }),
    prisma.application.findMany({
      where: whereClause,
      take,
      skip,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            careerGoal: {
              select: {
                targetRole: true,
                experienceLevel: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
            workMode: true,
            status: true,
          },
        },
        resume: {
          select: {
            id: true,
            originalFileName: true,
            fileType: true,
            fileSize: true,
          },
        },
        jobOptimization: {
          select: {
            id: true,
            matchScore: true,
          },
        },
      },
    }),
    getGlobalApplicationStats({ jobId }),
  ]);

  return {
    applications,
    stats: globalStats,
    pagination: {
      total,
      page: Number(page) || 1,
      limit: take,
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}

/**
 * Get detailed application for Admin view with private notes
 */
async function getAdminApplicationById({ adminId, applicationId }) {
  const prisma = getPrismaClient();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          careerGoal: true,
        },
      },
      job: true,
      resume: {
        select: {
          id: true,
          originalFileName: true,
          fileType: true,
          fileSize: true,
          storagePath: true,
          extractedText: true,
          status: true,
          createdAt: true,
        },
      },
      jobOptimization: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        include: {
          changedBy: {
            select: { id: true, name: true, role: true, email: true },
          },
        },
      },
      adminNotes: {
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!application) {
    throw { statusCode: 404, message: 'Application not found.' };
  }

  return application;
}

/**
 * Add Private Admin Note to Application
 */
async function addAdminNote({ adminId, applicationId, note }) {
  const prisma = getPrismaClient();

  if (!note || !note.trim()) {
    throw { statusCode: 400, message: 'Note content cannot be empty.' };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw { statusCode: 404, message: 'Application not found.' };
  }

  const createdNote = await prisma.applicationNote.create({
    data: {
      applicationId,
      adminId,
      note: note.trim(),
    },
    include: {
      admin: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return createdNote;
}

/**
 * Delete Private Admin Note
 */
async function deleteAdminNote({ adminId, noteId }) {
  const prisma = getPrismaClient();

  const note = await prisma.applicationNote.findUnique({
    where: { id: noteId },
  });

  if (!note) {
    throw { statusCode: 404, message: 'Note not found.' };
  }

  await prisma.applicationNote.delete({
    where: { id: noteId },
  });

  return { message: 'Note deleted successfully.' };
}

/**
 * Get global or job-filtered application summary statistics
 */
async function getGlobalApplicationStats(filters = {}) {
  const prisma = getPrismaClient();
  const whereClause = filters.jobId ? { jobId: filters.jobId } : {};

  const counts = await prisma.application.groupBy({
    by: ['status'],
    where: whereClause,
    _count: {
      id: true,
    },
  });

  const total = counts.reduce((acc, curr) => acc + curr._count.id, 0);

  const breakdown = {
    TOTAL: total,
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0,
  };

  counts.forEach((c) => {
    if (breakdown[c.status] !== undefined) {
      breakdown[c.status] = c._count.id;
    }
  });

  return breakdown;
}

/**
 * Get recent recruitment activity feed for Admin Dashboard
 */
async function getAdminActivityFeed({ limit = 10 } = {}) {
  const prisma = getPrismaClient();
  const take = Math.max(1, Math.min(50, Number(limit) || 10));

  const historyEvents = await prisma.applicationStatusHistory.findMany({
    take,
    orderBy: { createdAt: 'desc' },
    include: {
      application: {
        select: {
          id: true,
          matchScore: true,
          user: {
            select: { id: true, name: true, email: true },
          },
          job: {
            select: { id: true, title: true, companyName: true },
          },
        },
      },
      changedBy: {
        select: { id: true, name: true, role: true },
      },
    },
  });

  return historyEvents.map((evt) => ({
    id: evt.id,
    applicationId: evt.applicationId,
    candidateName: evt.application?.user?.name || 'Candidate',
    candidateEmail: evt.application?.user?.email || '',
    jobTitle: evt.application?.job?.title || 'Role',
    companyName: evt.application?.job?.companyName || 'Company',
    oldStatus: evt.oldStatus,
    newStatus: evt.newStatus,
    note: evt.note,
    matchScore: evt.application?.matchScore,
    actorName: evt.changedBy?.name || 'System / Admin',
    createdAt: evt.createdAt,
  }));
}

/**
 * Update application status by Admin
 */
async function updateApplicationStatus({
  adminId,
  applicationId,
  newStatus,
  note,
}) {
  const prisma = getPrismaClient();

  const normalizedStatus = (newStatus || '').toUpperCase();
  if (!VALID_STATUSES.includes(normalizedStatus)) {
    throw {
      statusCode: 400,
      message: `Invalid application status. Allowed: ${VALID_STATUSES.join(', ')}`,
    };
  }

  const existingApp = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: { id: true, title: true, companyName: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!existingApp) {
    throw { statusCode: 404, message: 'Application not found.' };
  }

  const oldStatus = existingApp.status;

  // If status is identical, just update note in history if provided
  const updatedApp = await prisma.$transaction(async (tx) => {
    const app = await tx.application.update({
      where: { id: applicationId },
      data: {
        status: normalizedStatus,
      },
      include: {
        job: true,
        resume: {
          select: {
            id: true,
            originalFileName: true,
            fileType: true,
            fileSize: true,
          },
        },
        jobOptimization: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            changedBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        adminNotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId,
        oldStatus,
        newStatus: normalizedStatus,
        changedById: adminId,
        note: note ? note.trim() : `Status updated to ${STATUS_LABELS[normalizedStatus] || normalizedStatus} by recruiting team.`,
      },
    });

    return app;
  }, { timeout: 20000, maxWait: 10000 });

  // Notify Candidate of status change
  const label = STATUS_LABELS[normalizedStatus] || normalizedStatus;
  await createNotification({
    userId: existingApp.userId,
    type: 'APPLICATION',
    title: `Application Update: ${label}`,
    message: `Your application for "${existingApp.job.title}" at ${existingApp.job.companyName} has been moved to ${label}.${note ? ` Note: "${note.trim()}"` : ''}`,
    actionUrl: `/applications/${applicationId}`,
    metadata: {
      applicationId,
      oldStatus,
      newStatus: normalizedStatus,
      jobId: existingApp.job.id,
    },
  }).catch((err) => console.error('[Notification Error Status Update]:', err.message));

  return updatedApp;
}

/**
 * Get job application summary statistics
 */
async function getJobApplicationStats({ jobId }) {
  return getGlobalApplicationStats({ jobId });
}

/**
 * Get secure signed resume URL for authorized users
 */
async function getSecureResumeDownloadUrl({ userId, role, resumeId }) {
  const prisma = getPrismaClient();

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: {
      id: true,
      userId: true,
      storagePath: true,
      originalFileName: true,
      fileType: true,
    },
  });

  if (!resume) {
    throw { statusCode: 404, message: 'Resume not found.' };
  }

  // If candidate, must own the resume
  if (role !== 'ADMIN' && resume.userId !== userId) {
    throw { statusCode: 403, message: 'Access denied to this resume file.' };
  }

  const signedUrl = await getSignedDownloadUrl(resume.storagePath, 3600);

  return {
    signedUrl,
    fileName: resume.originalFileName,
    fileType: resume.fileType,
    expiresInSeconds: 3600,
  };
}

module.exports = {
  submitApplication,
  getUserApplications,
  getUserApplicationById,
  checkUserJobApplication,
  getAdminApplications,
  getAdminApplicationById,
  updateApplicationStatus,
  getJobApplicationStats,
  getGlobalApplicationStats,
  addAdminNote,
  deleteAdminNote,
  getAdminActivityFeed,
  getSecureResumeDownloadUrl,
  VALID_STATUSES,
  STATUS_LABELS,
};

