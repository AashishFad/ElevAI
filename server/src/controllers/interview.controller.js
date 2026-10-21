const {
  createInterviewSession,
  submitQuestionAnswer,
  getUserInterviews,
  getInterviewSessionById,
  abandonInterviewSession,
} = require('../services/interviewService');

async function startInterview(req, res, next) {
  try {
    const { type, difficulty, inputMode, questionCount, resumeId, jobOptimizationId } = req.body;
    const userId = req.user.userId;

    const session = await createInterviewSession({
      userId,
      type,
      difficulty,
      inputMode,
      questionCount,
      resumeId,
      jobOptimizationId,
    });

    res.status(201).json({
      success: true,
      message: 'AI Mock Interview session started successfully',
      session,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

async function submitAnswer(req, res, next) {
  try {
    const { sessionId, questionId } = req.params;
    const {
      answerText,
      isSkipped,
      inputMode,
      transcript,
      durationSeconds,
      wordCount,
      speakingRate,
      fillerWordCount,
      fillerWords,
      voiceMetrics,
    } = req.body;
    const userId = req.user.userId;

    const result = await submitQuestionAnswer({
      userId,
      sessionId,
      questionId,
      answerText,
      isSkipped,
      inputMode,
      transcript,
      durationSeconds,
      wordCount,
      speakingRate,
      fillerWordCount,
      fillerWords,
      voiceMetrics,
    });

    res.status(200).json({
      success: true,
      message: 'Answer evaluated successfully',
      evaluation: result.answer,
      ...result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

async function getInterviews(req, res, next) {
  try {
    const userId = req.user.userId;
    const sessions = await getUserInterviews({ userId });

    res.status(200).json({
      success: true,
      sessions,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

async function getInterviewById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const session = await getInterviewSessionById({ userId, sessionId: id });

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

async function abandonInterview(req, res, next) {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const result = await abandonInterviewSession({ userId, sessionId });

    res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

module.exports = {
  startInterview,
  submitAnswer,
  getInterviews,
  getInterviewById,
  abandonInterview,
};
