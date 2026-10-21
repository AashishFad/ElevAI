const applicationService = require('../services/applicationService');

/**
 * Controller for Candidate & Admin Applications
 */

async function submitApplication(req, res, next) {
  try {
    const { jobId, resumeId, jobOptimizationId, coverLetter } = req.body;
    const application = await applicationService.submitApplication({
      userId: req.user.id,
      jobId,
      resumeId,
      jobOptimizationId,
      coverLetter,
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    next(error);
  }
}

async function getUserApplications(req, res, next) {
  try {
    const { page, limit, status } = req.query;
    const result = await applicationService.getUserApplications({
      userId: req.user.id,
      page,
      limit,
      status,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function getUserApplicationById(req, res, next) {
  try {
    const application = await applicationService.getUserApplicationById({
      userId: req.user.id,
      applicationId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
}

async function checkJobApplicationStatus(req, res, next) {
  try {
    const result = await applicationService.checkUserJobApplication({
      userId: req.user.id,
      jobId: req.params.jobId,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminApplications(req, res, next) {
  try {
    const { jobId, status, search, sortBy, page, limit } = req.query;
    const result = await applicationService.getAdminApplications({
      adminId: req.user.id,
      jobId,
      status,
      search,
      sortBy,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminApplicationById(req, res, next) {
  try {
    const application = await applicationService.getAdminApplicationById({
      adminId: req.user.id,
      applicationId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    const { status, note } = req.body;
    const application = await applicationService.updateApplicationStatus({
      adminId: req.user.id,
      applicationId: req.params.id,
      newStatus: status,
      note,
    });

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully.',
      application,
    });
  } catch (error) {
    next(error);
  }
}

async function addAdminNote(req, res, next) {
  try {
    const { note } = req.body;
    const createdNote = await applicationService.addAdminNote({
      adminId: req.user.id,
      applicationId: req.params.id,
      note,
    });

    return res.status(201).json({
      success: true,
      message: 'Admin note added successfully.',
      note: createdNote,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAdminNote(req, res, next) {
  try {
    const result = await applicationService.deleteAdminNote({
      adminId: req.user.id,
      noteId: req.params.noteId,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function getGlobalApplicationStats(req, res, next) {
  try {
    const { jobId } = req.query;
    const stats = await applicationService.getGlobalApplicationStats({ jobId });

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminActivityFeed(req, res, next) {
  try {
    const { limit } = req.query;
    const activities = await applicationService.getAdminActivityFeed({ limit });

    return res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    next(error);
  }
}

async function getJobApplicationStats(req, res, next) {
  try {
    const stats = await applicationService.getJobApplicationStats({
      jobId: req.params.jobId,
    });

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminResumeSecureUrl(req, res, next) {
  try {
    const result = await applicationService.getSecureResumeDownloadUrl({
      userId: req.user.id,
      role: req.user.role,
      resumeId: req.params.resumeId,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitApplication,
  getUserApplications,
  getUserApplicationById,
  checkJobApplicationStatus,
  getAdminApplications,
  getAdminApplicationById,
  updateApplicationStatus,
  addAdminNote,
  deleteAdminNote,
  getGlobalApplicationStats,
  getAdminActivityFeed,
  getJobApplicationStats,
  getAdminResumeSecureUrl,
};
