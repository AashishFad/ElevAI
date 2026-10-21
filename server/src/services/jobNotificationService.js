const { getPrismaClient } = require('../config/database');
const { createNotification } = require('./notificationService');

/**
 * Job Notification & Targeting Dispatch Engine for ElevAI
 */

async function dispatchJobPublishedNotifications({ jobId }) {
  const prisma = getPrismaClient();

  try {
    // 1. Fetch the published job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        creator: {
          select: { id: true, name: true },
        },
      },
    });

    if (!job || job.status !== 'PUBLISHED') {
      return { targetedUsersCount: 0, notificationsSentCount: 0 };
    }

    // 2. Fetch all student candidates (role = USER) with career goals and preferences
    const candidateUsers = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
      include: {
        careerGoal: true,
        notificationPreference: true,
        analyses: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            skillsFound: true,
          },
        },
      },
    });

    if (!candidateUsers || candidateUsers.length === 0) {
      return { targetedUsersCount: 0, notificationsSentCount: 0 };
    }

    // 3. Relevance & Targeting Filter
    const jobTitleLower = job.title.toLowerCase();
    const requiredSkillsList = Array.isArray(job.requiredSkills)
      ? job.requiredSkills.map((s) => String(s).toLowerCase().trim())
      : [];

    const targetedUsers = candidateUsers.filter((user) => {
      // If user has disabled job notifications in settings, skip
      if (user.notificationPreference && user.notificationPreference.jobEnabled === false) {
        return false;
      }

      // Check Target Role Relevance
      if (user.careerGoal?.targetRole) {
        const targetRoleLower = user.careerGoal.targetRole.toLowerCase();
        // Check if words in target role overlap with job title
        const targetTokens = targetRoleLower.split(/\s+/).filter((t) => t.length > 2);
        const hasRoleOverlap = targetTokens.some(
          (token) => jobTitleLower.includes(token) || token.includes('developer') || token.includes('engineer')
        );
        if (hasRoleOverlap) return true;
      }

      // Check Skills Overlap from latest resume analysis
      if (user.analyses && user.analyses.length > 0) {
        const skillsFound = user.analyses[0].skillsFound;
        if (Array.isArray(skillsFound)) {
          const userSkillsLower = skillsFound.map((s) => String(s).toLowerCase().trim());
          const hasSkillOverlap = requiredSkillsList.some((req) =>
            userSkillsLower.some((uskill) => uskill.includes(req) || req.includes(uskill))
          );
          if (hasSkillOverlap) return true;
        }
      }

      // Default baseline: All active student users are considered eligible candidates
      return true;
    });

    // 4. Duplicate Prevention & Notification Dispatch
    let notificationsSentCount = 0;

    for (const user of targetedUsers) {
      // Check if user has already received a notification for this exact job
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          type: 'JOB',
          metadata: {
            path: ['jobId'],
            equals: job.id,
          },
        },
      });

      if (!existingNotification) {
        const created = await createNotification({
          userId: user.id,
          type: 'JOB',
          title: `New Job Opportunity: ${job.title}`,
          message: `${job.companyName} is hiring for ${job.title} (${job.workMode}, ${job.location}). Check qualifications and analyze your resume.`,
          actionUrl: `/jobs/${job.id}`,
          metadata: {
            jobId: job.id,
            companyName: job.companyName,
            location: job.location,
            workMode: job.workMode,
            employmentType: job.employmentType,
          },
        });

        if (created) {
          notificationsSentCount++;
        }
      }
    }

    return {
      targetedUsersCount: targetedUsers.length,
      notificationsSentCount,
    };
  } catch (error) {
    console.error('[Job Notification Dispatch Error]:', error.message || error);
    return { targetedUsersCount: 0, notificationsSentCount: 0, error: error.message };
  }
}

module.exports = {
  dispatchJobPublishedNotifications,
};
