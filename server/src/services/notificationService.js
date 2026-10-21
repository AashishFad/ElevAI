const { getPrismaClient } = require('../config/database');

/**
 * Get or create User Notification Preferences
 */
async function getUserPreferences({ userId }) {
  const prisma = getPrismaClient();

  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: {
        userId,
        resumeEnabled: true,
        jobEnabled: true,
        skillGapEnabled: true,
        interviewEnabled: true,
        reminderEnabled: true,
      },
    });
  }

  return prefs;
}

/**
 * Update User Notification Preferences
 */
async function updateUserPreferences({ userId, data }) {
  const prisma = getPrismaClient();

  const updated = await prisma.notificationPreference.upsert({
    where: { userId },
    create: {
      userId,
      resumeEnabled: data.resumeEnabled !== undefined ? Boolean(data.resumeEnabled) : true,
      jobEnabled: data.jobEnabled !== undefined ? Boolean(data.jobEnabled) : true,
      skillGapEnabled: data.skillGapEnabled !== undefined ? Boolean(data.skillGapEnabled) : true,
      interviewEnabled: data.interviewEnabled !== undefined ? Boolean(data.interviewEnabled) : true,
      reminderEnabled: data.reminderEnabled !== undefined ? Boolean(data.reminderEnabled) : true,
    },
    update: {
      resumeEnabled: data.resumeEnabled !== undefined ? Boolean(data.resumeEnabled) : undefined,
      jobEnabled: data.jobEnabled !== undefined ? Boolean(data.jobEnabled) : undefined,
      skillGapEnabled: data.skillGapEnabled !== undefined ? Boolean(data.skillGapEnabled) : undefined,
      interviewEnabled: data.interviewEnabled !== undefined ? Boolean(data.interviewEnabled) : undefined,
      reminderEnabled: data.reminderEnabled !== undefined ? Boolean(data.reminderEnabled) : undefined,
    },
  });

  return updated;
}

/**
 * Safely Create In-App Notification (Event Triggered)
 */
async function createNotification({ userId, type, title, message, actionUrl, metadata }) {
  const prisma = getPrismaClient();

  try {
    // 1. Check user preferences
    const prefs = await getUserPreferences({ userId });

    const isEnabled =
      type === 'SYSTEM' ||
      type === 'RESUME_BUILDER' ||
      type === 'APPLICATION' ||
      (type === 'RESUME' && prefs.resumeEnabled) ||
      (type === 'JOB' && prefs.jobEnabled) ||
      (type === 'SKILL_GAP' && prefs.skillGapEnabled) ||
      (type === 'INTERVIEW' && prefs.interviewEnabled) ||
      (type === 'REMINDER' && prefs.reminderEnabled);

    if (!isEnabled) {
      return null;
    }

    // 2. Prevent duplicate notifications for identical recent events (within 2 hours)
    if (metadata && typeof metadata === 'object') {
      const entityId = metadata.analysisId || metadata.improvementId || metadata.jobOptimizationId || metadata.skillGapId || metadata.sessionId || metadata.documentId || metadata.applicationId;
      if (entityId) {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const existingRecent = await prisma.notification.findFirst({
          where: {
            userId,
            type,
            createdAt: { gte: twoHoursAgo },
          },
        });

        if (existingRecent) {
          // Skip creating duplicate notification
          return existingRecent;
        }
      }
    }

    // 3. Create Notification record
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actionUrl: actionUrl || null,
        metadata: metadata || null,
      },
    });

    return notification;
  } catch (error) {
    // Failure in notification creation must NEVER break core feature caller
    console.error('[Notification Service Warning]: Failed to create notification:', error.message || error);
    return null;
  }
}

/**
 * Get Paginated User Notifications
 */
async function getUserNotifications({ userId, page = 1, limit = 20, unreadOnly = false }) {
  const prisma = getPrismaClient();

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const whereClause = {
    userId,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.notification.count({ where: whereClause }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    page: pageNum,
    limit: limitNum,
    total,
    hasMore: skip + notifications.length < total,
    unreadCount,
  };
}

/**
 * Get Count of Unread Notifications
 */
async function getUnreadCount({ userId }) {
  const prisma = getPrismaClient();

  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  return count;
}

/**
 * Mark a single notification as read
 */
async function markAsRead({ userId, notificationId }) {
  const prisma = getPrismaClient();

  const notif = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notif) {
    throw { statusCode: 404, message: 'Notification not found or access denied.' };
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return updated;
}

/**
 * Bulk mark all notifications as read for user
 */
async function markAllAsRead({ userId }) {
  const prisma = getPrismaClient();

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return { success: true, message: 'All notifications marked as read.' };
}

/**
 * Delete a notification
 */
async function deleteNotification({ userId, notificationId }) {
  const prisma = getPrismaClient();

  const notif = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notif) {
    throw { statusCode: 404, message: 'Notification not found or access denied.' };
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return { success: true, message: 'Notification deleted successfully.' };
}

/**
 * Generate limited smart preparation reminders
 */
async function generateSmartReminders({ userId }) {
  const prisma = getPrismaClient();

  try {
    const careerGoal = await prisma.careerGoal.findUnique({
      where: { userId },
    });

    if (!careerGoal) return;

    // Check if user completed an interview in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentInterview = await prisma.interviewSession.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: sevenDaysAgo },
      },
    });

    if (!recentInterview) {
      await createNotification({
        userId,
        type: 'REMINDER',
        title: 'Mock Interview Reminder',
        message: `You haven't completed a mock interview recently for your target role (${careerGoal.targetRole}). Practice now to boost confidence!`,
        actionUrl: '/mock-interview',
        metadata: { reminderKey: 'no_recent_interview' },
      });
    }
  } catch (err) {
    console.warn('[Smart Reminder Warning]:', err.message || err);
  }
}

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  generateSmartReminders,
};
