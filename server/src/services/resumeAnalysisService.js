const { getPrismaClient } = require('../config/database');
const { generateResumeAnalysis } = require('../ai/aiService');
const { createNotification } = require('./notificationService');

/**
 * Execute AI resume analysis against user's active career goal
 */
async function performResumeAnalysis({ userId, resumeId }) {
  const prisma = getPrismaClient();

  // 1. Fetch & verify Resume ownership and status
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
  });

  if (!resume) {
    throw { statusCode: 404, message: 'Resume not found or access denied.' };
  }

  if (resume.status !== 'READY') {
    throw {
      statusCode: 400,
      message: `Resume cannot be analyzed. Current status is ${resume.status}. Ensure file text extraction has completed successfully.`,
    };
  }

  if (!resume.extractedText || resume.extractedText.trim().length < 50) {
    throw {
      statusCode: 400,
      message: "We couldn't extract enough readable text from this resume to analyze it.",
    };
  }

  // 2. Fetch active CareerGoal
  const careerGoal = await prisma.careerGoal.findUnique({
    where: { userId },
  });

  if (!careerGoal) {
    throw {
      statusCode: 400,
      message: 'Please set your career goal before analyzing your resume.',
    };
  }

  // 3. Call Gemini AI service
  const aiResult = await generateResumeAnalysis({
    targetRole: careerGoal.targetRole,
    experienceLevel: careerGoal.experienceLevel,
    resumeText: resume.extractedText,
  });

  // 4. Save analysis record in database
  const analysisRecord = await prisma.resumeAnalysis.create({
    data: {
      userId,
      resumeId: resume.id,
      careerGoalId: careerGoal.id,
      overallScore: aiResult.overallScore,
      summary: aiResult.summary,
      scoreBreakdown: aiResult.scoreBreakdown,
      strengths: aiResult.strengths,
      weaknesses: aiResult.weaknesses,
      sectionFeedback: aiResult.sectionFeedback,
      skillsFound: aiResult.skillsFound,
      recommendedSkills: aiResult.recommendedSkills,
      actionItems: aiResult.actionItems,
    },
  });

  // 5. Trigger In-App Notification
  await createNotification({
    userId,
    type: 'RESUME',
    title: 'Resume Analysis Complete',
    message: `Your AI resume analysis is ready to review. Overall score: ${aiResult.overallScore}/100.`,
    actionUrl: `/resume/${resume.id}/analysis/${analysisRecord.id}`,
    metadata: { analysisId: analysisRecord.id },
  });

  return {
    ...analysisRecord,
    targetRole: careerGoal.targetRole,
    experienceLevel: careerGoal.experienceLevel,
  };
}

/**
 * Fetch all analyses for a given resume
 */
async function getAnalysesForResume({ userId, resumeId }) {
  const prisma = getPrismaClient();

  // Verify resume ownership
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!resume) {
    throw { statusCode: 404, message: 'Resume not found or access denied.' };
  }

  const analyses = await prisma.resumeAnalysis.findMany({
    where: { resumeId, userId },
    include: {
      careerGoal: {
        select: {
          targetRole: true,
          experienceLevel: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return analyses;
}

/**
 * Fetch single analysis by ID with ownership verification
 */
async function getAnalysisById({ userId, analysisId }) {
  const prisma = getPrismaClient();

  const analysis = await prisma.resumeAnalysis.findFirst({
    where: {
      id: analysisId,
      userId,
    },
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
  });

  if (!analysis) {
    throw { statusCode: 404, message: 'Analysis result not found or access denied.' };
  }

  return analysis;
}

module.exports = {
  performResumeAnalysis,
  getAnalysesForResume,
  getAnalysisById,
};
