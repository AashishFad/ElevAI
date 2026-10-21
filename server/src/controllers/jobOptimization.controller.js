const {
  createJobOptimization,
  getUserJobOptimizations,
  getJobOptimizationById,
  deleteJobOptimization,
} = require('../services/jobOptimizationService');

async function createOptimization(req, res, next) {
  try {
    const { resumeId, jobDescription, companyName, jobTitle, jobLocation, requiredSkills } = req.body;
    const userId = req.user.userId;

    const optimization = await createJobOptimization({
      userId,
      resumeId,
      jobDescription,
      companyName,
      jobTitle,
      jobLocation,
      requiredSkills,
    });

    res.status(201).json({
      success: true,
      message: 'Job-Specific Resume Optimization completed successfully',
      optimization,
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

async function getOptimizations(req, res, next) {
  try {
    const userId = req.user.userId;
    const optimizations = await getUserJobOptimizations({ userId });

    res.status(200).json({
      success: true,
      optimizations,
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

async function getSingleOptimization(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const optimization = await getJobOptimizationById({ userId, optimizationId: id });

    res.status(200).json({
      success: true,
      optimization,
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

async function removeOptimization(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await deleteJobOptimization({ userId, optimizationId: id });

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
  createOptimization,
  getOptimizations,
  getSingleOptimization,
  removeOptimization,
};
