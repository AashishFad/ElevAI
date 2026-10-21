const analyticsService = require('../services/analyticsService');

/**
 * Controller for Admin Recruitment Analytics
 */

async function getOverviewAnalytics(req, res, next) {
  try {
    const data = await analyticsService.getOverviewAnalytics();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getApplicationTrends(req, res, next) {
  try {
    const { range } = req.query;
    const data = await analyticsService.getApplicationTrends({ range });
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getJobPerformanceAnalytics(req, res, next) {
  try {
    const { sortBy, status } = req.query;
    const data = await analyticsService.getJobPerformanceAnalytics({ sortBy, status });
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getSkillDemandAnalytics(req, res, next) {
  try {
    const { limit } = req.query;
    const data = await analyticsService.getSkillDemandAnalytics({
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getDeadlineInsights(req, res, next) {
  try {
    const data = await analyticsService.getDeadlineInsights();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getRecruitmentInsights(req, res, next) {
  try {
    const data = await analyticsService.getRecruitmentInsights();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverviewAnalytics,
  getApplicationTrends,
  getJobPerformanceAnalytics,
  getSkillDemandAnalytics,
  getDeadlineInsights,
  getRecruitmentInsights,
};
