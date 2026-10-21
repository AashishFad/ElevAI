const {
  performResumeAnalysis,
  getAnalysesForResume,
  getAnalysisById,
} = require('../services/resumeAnalysisService');

async function analyzeResume(req, res, next) {
  try {
    const { resumeId } = req.params;
    const userId = req.user.userId;

    const analysis = await performResumeAnalysis({ userId, resumeId });

    res.status(201).json({
      success: true,
      message: 'AI Resume Analysis completed successfully',
      analysis,
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

async function getAnalyses(req, res, next) {
  try {
    const { resumeId } = req.params;
    const userId = req.user.userId;

    const analyses = await getAnalysesForResume({ userId, resumeId });

    res.status(200).json({
      success: true,
      analyses,
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

async function getSingleAnalysis(req, res, next) {
  try {
    const { analysisId } = req.params;
    const userId = req.user.userId;

    const analysis = await getAnalysisById({ userId, analysisId });

    res.status(200).json({
      success: true,
      analysis,
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

module.exports = {
  analyzeResume,
  getAnalyses,
  getSingleAnalysis,
};
