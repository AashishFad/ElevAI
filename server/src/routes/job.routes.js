const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { validateUUIDParams } = require('../middleware/validateParams');
const {
  getPublishedJobs,
  getPublicJobById,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
} = require('../controllers/job.controller');

const router = express.Router();

// Public / Student route to list ONLY published jobs & details
router.get('/', getPublishedJobs);
router.get('/:id', validateUUIDParams('id'), getPublicJobById);

// Admin-protected job management operations on /api/jobs
router.post('/', authMiddleware, requireAdmin, createJob);
router.put('/:id', authMiddleware, requireAdmin, validateUUIDParams('id'), updateJob);
router.patch('/:id/status', authMiddleware, requireAdmin, validateUUIDParams('id'), updateJobStatus);
router.post('/:id/publish', authMiddleware, requireAdmin, validateUUIDParams('id'), (req, res, next) => {
  req.body = { ...req.body, status: 'PUBLISHED' };
  return updateJobStatus(req, res, next);
});
router.delete('/:id', authMiddleware, requireAdmin, validateUUIDParams('id'), deleteJob);

module.exports = router;
