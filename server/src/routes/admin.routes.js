const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { validateUUIDParams } = require('../middleware/validateParams');
const { getOverview, listUsers } = require('../controllers/admin.controller');
const {
  createJob,
  getAdminJobs,
  getAdminJobById,
  updateJob,
  updateJobStatus,
  deleteJob,
} = require('../controllers/job.controller');
const {
  getAdminApplications,
  getAdminApplicationById,
  updateApplicationStatus,
  addAdminNote,
  deleteAdminNote,
  getGlobalApplicationStats,
  getAdminActivityFeed,
  getJobApplicationStats,
  getAdminResumeSecureUrl,
} = require('../controllers/application.controller');
const {
  getOverviewAnalytics,
  getApplicationTrends,
  getJobPerformanceAnalytics,
  getSkillDemandAnalytics,
  getDeadlineInsights,
  getRecruitmentInsights,
} = require('../controllers/analytics.controller');

const router = express.Router();

// All /api/admin/* routes require authentication and ADMIN role
router.use(authMiddleware);
router.use(requireAdmin);

// Overview & User Management
router.get('/overview', getOverview);
router.get('/users', listUsers);
router.get('/activity-feed', getAdminActivityFeed);

// Recruitment Analytics Engine (Phase 6)
router.get('/analytics/overview', getOverviewAnalytics);
router.get('/analytics/trends', getApplicationTrends);
router.get('/analytics/job-performance', getJobPerformanceAnalytics);
router.get('/analytics/skills', getSkillDemandAnalytics);
router.get('/analytics/deadlines', getDeadlineInsights);
router.get('/analytics/insights', getRecruitmentInsights);

// Job Management (Phase 2 & Phase 5)
router.post('/jobs', createJob);
router.get('/jobs', getAdminJobs);
router.get('/jobs/:id', validateUUIDParams('id'), getAdminJobById);
router.put('/jobs/:id', validateUUIDParams('id'), updateJob);
router.patch('/jobs/:id/status', validateUUIDParams('id'), updateJobStatus);
router.delete('/jobs/:id', validateUUIDParams('id'), deleteJob);
router.get('/jobs/:jobId/application-stats', validateUUIDParams('jobId'), getJobApplicationStats);

// Candidate Applications & Recruitment Review (Phase 4 & Phase 5)
router.get('/applications/stats', getGlobalApplicationStats);
router.get('/applications', getAdminApplications);
router.get('/applications/:id', validateUUIDParams('id'), getAdminApplicationById);
router.patch('/applications/:id/status', validateUUIDParams('id'), updateApplicationStatus);
router.post('/applications/:id/notes', validateUUIDParams('id'), addAdminNote);
router.delete('/applications/notes/:noteId', validateUUIDParams('noteId'), deleteAdminNote);
router.get('/resumes/:resumeId/secure-url', validateUUIDParams('resumeId'), getAdminResumeSecureUrl);

module.exports = router;
