const { getPrismaClient } = require('../config/database');
const {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
} = require('../ai/aiService');
const { createNotification } = require('./notificationService');

/**
 * Start a new AI Mock Interview Session
 */
async function createInterviewSession({
  userId,
  type = 'TECHNICAL',
  difficulty = 'INTERMEDIATE',
  inputMode = 'TEXT',
  questionCount = 5,
  resumeId,
  jobOptimizationId,
}) {
  const prisma = getPrismaClient();

  // 1. Fetch active CareerGoal
  const careerGoal = await prisma.careerGoal.findUnique({
    where: { userId },
  });

  if (!careerGoal) {
    throw {
      statusCode: 400,
      message: 'Please configure your career goal before starting an AI mock interview.',
    };
  }

  // 2. Fetch optional Resume if provided
  let resume = null;
  if (resumeId) {
    resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });
    if (!resume) {
      throw { statusCode: 404, message: 'Selected resume not found or access denied.' };
    }
    if (resume.status !== 'READY') {
      throw {
        statusCode: 400,
        message: 'Selected resume is not ready. Text extraction must be completed first.',
      };
    }
  }

  // 3. Fetch optional Job Optimization if provided
  let jobOptimization = null;
  if (jobOptimizationId) {
    jobOptimization = await prisma.jobOptimization.findFirst({
      where: { id: jobOptimizationId, userId },
    });
    if (!jobOptimization) {
      throw { statusCode: 404, message: 'Selected job optimization target not found or access denied.' };
    }
  }

  const validCount = Math.max(3, Math.min(15, parseInt(questionCount, 10) || 5));
  const mode = inputMode === 'VOICE' ? 'VOICE' : 'TEXT';

  // 4. Generate AI Interview Questions via Gemini
  const generatedResult = await generateInterviewQuestions({
    targetRole: careerGoal.targetRole,
    experienceLevel: careerGoal.experienceLevel,
    type,
    difficulty,
    questionCount: validCount,
    resumeText: resume ? resume.extractedText : undefined,
    jobOptimization,
  });

  const generatedQuestions = Array.isArray(generatedResult)
    ? generatedResult
    : (generatedResult && Array.isArray(generatedResult.questions) ? generatedResult.questions : []);

  // 5. Store session and questions in Prisma transaction
  const session = await prisma.interviewSession.create({
    data: {
      userId,
      careerGoalId: careerGoal.id,
      resumeId: resume ? resume.id : null,
      jobOptimizationId: jobOptimization ? jobOptimization.id : null,
      type,
      difficulty,
      inputMode: mode,
      targetRole: careerGoal.targetRole,
      questionCount: generatedQuestions.length,
      status: 'IN_PROGRESS',
      currentQuestionIndex: 0,
      questions: {
        create: generatedQuestions.map((q, idx) => ({
          questionNumber: q.questionNumber || idx + 1,
          questionText: q.questionText,
          category: q.category || 'TECHNICAL',
          difficulty: q.difficulty || difficulty,
          expectedTopics: Array.isArray(q.expectedTopics) ? q.expectedTopics : [],
        })),
      },
    },
    include: {
      questions: {
        orderBy: { questionNumber: 'asc' },
      },
    },
  });

  return session;
}

/**
 * Submit and evaluate an answer for a specific question
 */
async function submitQuestionAnswer({
  userId,
  sessionId,
  questionId,
  answerText,
  isSkipped = false,
  inputMode = 'TEXT',
  transcript,
  durationSeconds,
  wordCount,
  speakingRate,
  fillerWordCount,
  fillerWords,
  voiceMetrics,
}) {
  const prisma = getPrismaClient();

  // 1. Fetch and verify Session ownership
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      careerGoal: true,
      questions: {
        include: { answer: true },
        orderBy: { questionNumber: 'asc' },
      },
    },
  });

  if (!session) {
    throw { statusCode: 404, message: 'Interview session not found or access denied.' };
  }

  if (session.status === 'COMPLETED') {
    throw { statusCode: 400, message: 'This interview session has already been completed.' };
  }

  // 2. Find target Question
  const question = session.questions.find((q) => q.id === questionId);
  if (!question) {
    throw { statusCode: 404, message: 'Question does not belong to this interview session.' };
  }

  // 3. Verify question hasn't already been answered
  if (question.answer) {
    throw { statusCode: 400, message: 'This question has already been answered.' };
  }

  let evaluationResult = null;

  if (isSkipped || !answerText || answerText.trim().length === 0) {
    evaluationResult = {
      score: 0,
      technicalScore: 0,
      relevanceScore: 0,
      communicationScore: 0,
      strengths: ['N/A (Question skipped)'],
      weaknesses: ['Question was skipped by candidate.'],
      feedback: 'This question was skipped without providing an answer.',
      idealAnswer: 'A complete response should address the expected technical and behavioral topics.',
    };
  } else {
    // 4. Call Gemini answer evaluation
    evaluationResult = await evaluateInterviewAnswer({
      questionText: question.questionText,
      expectedTopics: question.expectedTopics,
      answerText: answerText.trim(),
      type: session.type,
      targetRole: session.targetRole,
      experienceLevel: session.careerGoal?.experienceLevel || 'FRESHER',
    });
  }

  const mode = inputMode === 'VOICE' || session.inputMode === 'VOICE' ? 'VOICE' : 'TEXT';
  const finalScore = Number(evaluationResult.score !== undefined ? evaluationResult.score : evaluationResult.overallScore) || 0;
  const finalTech = Number(evaluationResult.technicalScore !== undefined ? evaluationResult.technicalScore : finalScore) || 0;
  const finalComm = Number(evaluationResult.communicationScore !== undefined ? evaluationResult.communicationScore : finalScore) || 0;
  const finalRel = Number(evaluationResult.relevanceScore !== undefined ? evaluationResult.relevanceScore : finalScore) || 0;

  // 5. Store Answer evaluation & optional voice metrics
  const savedAnswer = await prisma.interviewAnswer.create({
    data: {
      questionId: question.id,
      inputMode: mode,
      answerText: answerText ? answerText.trim() : '(Skipped)',
      transcript: transcript || (mode === 'VOICE' ? answerText : null),
      durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : null,
      wordCount: wordCount ? parseInt(wordCount, 10) : null,
      speakingRate: speakingRate ? parseInt(speakingRate, 10) : null,
      fillerWordCount: fillerWordCount ? parseInt(fillerWordCount, 10) : null,
      fillerWords: fillerWords || null,
      voiceMetrics: voiceMetrics || null,
      score: finalScore,
      technicalScore: finalTech,
      communicationScore: finalComm,
      relevanceScore: finalRel,
      feedback: evaluationResult.feedback || 'Answer evaluated.',
      strengths: Array.isArray(evaluationResult.strengths) ? evaluationResult.strengths : [],
      weaknesses: Array.isArray(evaluationResult.weaknesses) ? evaluationResult.weaknesses : [],
      idealAnswer: evaluationResult.idealAnswer || 'Clear, structured explanation with technical examples.',
      isSkipped: Boolean(isSkipped),
    },
  });

  // 6. Calculate progress and check if all questions answered
  const updatedQuestions = await prisma.interviewQuestion.findMany({
    where: { interviewSessionId: sessionId },
    include: { answer: true },
  });

  const answeredCount = updatedQuestions.filter((q) => q.answer !== null).length;
  const isFinished = answeredCount >= session.questionCount;

  let overallScore = null;
  let technicalScore = null;
  let communicationScore = null;
  let relevanceScore = null;

  if (isFinished) {
    const answers = updatedQuestions.map((q) => q.answer).filter(Boolean);
    const sumOverall = answers.reduce((acc, a) => acc + a.score, 0);
    const sumTech = answers.reduce((acc, a) => acc + a.technicalScore, 0);
    const sumComm = answers.reduce((acc, a) => acc + a.communicationScore, 0);
    const sumRel = answers.reduce((acc, a) => acc + a.relevanceScore, 0);

    const count = answers.length || 1;
    // Scale 0-10 scores to 0-100 for final report
    overallScore = Math.round((sumOverall / count) * 10);
    technicalScore = Math.round((sumTech / count) * 10);
    communicationScore = Math.round((sumComm / count) * 10);
    relevanceScore = Math.round((sumRel / count) * 10);

    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        currentQuestionIndex: answeredCount,
        overallScore,
        technicalScore,
        communicationScore,
        relevanceScore,
        completedAt: new Date(),
      },
    });

    // Trigger In-App Notification
    await createNotification({
      userId,
      type: 'INTERVIEW',
      title: 'Mock Interview Complete',
      message: `Your AI mock interview for ${session.targetRole} is complete. You scored ${overallScore}/100.`,
      actionUrl: `/mock-interview/${sessionId}/result`,
      metadata: { sessionId, score: overallScore },
    });
  } else {
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        currentQuestionIndex: answeredCount,
      },
    });
  }

  return {
    answer: savedAnswer,
    progress: {
      currentQuestionIndex: answeredCount,
      totalQuestions: session.questionCount,
      isCompleted: isFinished,
    },
  };
}

/**
 * Fetch list of user interview sessions
 */
async function getUserInterviews({ userId }) {
  const prisma = getPrismaClient();

  const sessions = await prisma.interviewSession.findMany({
    where: { userId },
    include: {
      resume: { select: { originalFileName: true } },
      jobOptimization: { select: { companyName: true, jobTitle: true } },
      _count: { select: { questions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return sessions;
}

/**
 * Fetch single interview session with questions and evaluations
 */
async function getInterviewSessionById({ userId, sessionId }) {
  const prisma = getPrismaClient();

  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      careerGoal: { select: { targetRole: true, experienceLevel: true } },
      resume: { select: { originalFileName: true, id: true } },
      jobOptimization: { select: { companyName: true, jobTitle: true, id: true } },
      questions: {
        include: { answer: true },
        orderBy: { questionNumber: 'asc' },
      },
    },
  });

  if (!session) {
    throw { statusCode: 404, message: 'Interview session not found or access denied.' };
  }

  return session;
}

/**
 * Mark an interview session as abandoned if user exits midway
 */
async function abandonInterviewSession({ userId, sessionId }) {
  const prisma = getPrismaClient();

  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw { statusCode: 404, message: 'Interview session not found or access denied.' };
  }

  if (session.status === 'COMPLETED') {
    return { success: true, message: 'Session is already completed.' };
  }

  await prisma.interviewSession.update({
    where: { id: sessionId },
    data: { status: 'ABANDONED' },
  });

  return { success: true, message: 'Interview marked as abandoned.' };
}

module.exports = {
  createInterviewSession,
  submitQuestionAnswer,
  getUserInterviews,
  getInterviewSessionById,
  abandonInterviewSession,
};
