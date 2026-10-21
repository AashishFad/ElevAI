const { getPrismaClient } = require('../config/database');
const { generateJobOptimization } = require('../ai/aiService');
const { createNotification } = require('./notificationService');

/**
 * Execute AI Job-Specific Resume Optimization
 */
async function createJobOptimization({
  userId,
  resumeId,
  jobDescription,
  companyName,
  jobTitle,
  jobLocation,
  requiredSkills = [],
}) {
  const prisma = getPrismaClient();

  if (!jobDescription || jobDescription.trim().length < 50) {
    throw {
      statusCode: 400,
      message: 'Job description must be at least 50 characters long to perform a meaningful match analysis.',
    };
  }

  // 1. Fetch & verify Resume ownership and status
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!resume) {
    throw { statusCode: 404, message: 'Resume not found or access denied.' };
  }

  if (resume.status !== 'READY') {
    throw {
      statusCode: 400,
      message: `Resume cannot be analyzed for job match. Current status is ${resume.status}. Ensure file text extraction has completed successfully.`,
    };
  }

  if (!resume.extractedText || resume.extractedText.trim().length < 50) {
    throw {
      statusCode: 400,
      message: "We couldn't extract enough readable text from this resume to analyze job match.",
    };
  }

  // 2. Fetch active CareerGoal
  const careerGoal = await prisma.careerGoal.findUnique({
    where: { userId },
  });

  if (!careerGoal) {
    throw {
      statusCode: 400,
      message: 'Please set your career goal before performing job optimization.',
    };
  }

  // 3. Call Ollama AI Job Optimization Service
  const aiResult = await generateJobOptimization({
    targetRole: careerGoal.targetRole,
    experienceLevel: careerGoal.experienceLevel,
    resumeText: resume.extractedText,
    jobDescription: jobDescription.trim(),
    companyName: companyName ? companyName.trim() : null,
    jobTitle: jobTitle ? jobTitle.trim() : null,
    jobLocation: jobLocation ? jobLocation.trim() : null,
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
  });

  // 4. Save job optimization record in database
  const optimizationRecord = await prisma.jobOptimization.create({
    data: {
      userId,
      resumeId: resume.id,
      careerGoalId: careerGoal.id,
      companyName: companyName ? companyName.trim() : null,
      jobTitle: jobTitle ? jobTitle.trim() : null,
      jobLocation: jobLocation ? jobLocation.trim() : null,
      jobDescription: jobDescription.trim(),
      matchScore: aiResult.matchScore,
      summary: aiResult.summary,
      matchingSkills: aiResult.matchingSkills,
      missingSkills: aiResult.missingSkills,
      partialMatches: aiResult.partialMatches,
      keywordSuggestions: aiResult.keywordSuggestions,
      sectionRecommendations: aiResult.sectionRecommendations,
      projectRecommendations: aiResult.projectRecommendations,
      priorityActions: aiResult.priorityActions,
    },
  });

  // 5. Trigger In-App Notification
  await createNotification({
    userId,
    type: 'JOB',
    title: 'Job Optimization Complete',
    message: `Your resume optimization for ${companyName ? `${companyName} (${jobTitle || 'Role'})` : jobTitle || 'Target Job'} is ready. Match Score: ${aiResult.matchScore}/100.`,
    actionUrl: `/job-optimization/${optimizationRecord.id}`,
    metadata: { jobOptimizationId: optimizationRecord.id },
  });

  return {
    ...optimizationRecord,
    targetRole: careerGoal.targetRole,
    experienceLevel: careerGoal.experienceLevel,
  };
}

/**
 * Fetch all job optimizations for authenticated user
 */
async function getUserJobOptimizations({ userId }) {
  const prisma = getPrismaClient();

  const optimizations = await prisma.jobOptimization.findMany({
    where: { userId },
    include: {
      resume: {
        select: {
          originalFileName: true,
        },
      },
      careerGoal: {
        select: {
          targetRole: true,
          experienceLevel: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return optimizations;
}

/**
 * Fetch single job optimization by ID with ownership verification
 */
async function getJobOptimizationById({ userId, optimizationId }) {
  const prisma = getPrismaClient();

  const optimization = await prisma.jobOptimization.findFirst({
    where: {
      id: optimizationId,
      userId,
    },
    include: {
      resume: {
        select: {
          originalFileName: true,
          id: true,
        },
      },
      careerGoal: {
        select: {
          targetRole: true,
          experienceLevel: true,
        },
      },
    },
  });

  if (!optimization) {
    throw { statusCode: 404, message: 'Job optimization report not found or access denied.' };
  }

  return optimization;
}

/**
 * Delete a job optimization by ID with ownership verification
 */
async function deleteJobOptimization({ userId, optimizationId }) {
  const prisma = getPrismaClient();

  const existing = await prisma.jobOptimization.findFirst({
    where: { id: optimizationId, userId },
  });

  if (!existing) {
    throw { statusCode: 404, message: 'Job optimization record not found or access denied.' };
  }

  await prisma.jobOptimization.delete({
    where: { id: optimizationId },
  });

  return { success: true, message: 'Job optimization record deleted successfully.' };
}

module.exports = {
  createJobOptimization,
  getUserJobOptimizations,
  getJobOptimizationById,
  deleteJobOptimization,
};
