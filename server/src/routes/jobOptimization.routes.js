const express = require('express');
const {
  createOptimization,
  getOptimizations,
  getSingleOptimization,
  removeOptimization,
} = require('../controllers/jobOptimization.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { validateUUIDParams } = require('../middleware/validateParams');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authMiddleware);

// Job Optimization Endpoints
router.post('/job-optimization', aiRateLimiter, createOptimization);
router.get('/job-optimization', getOptimizations);
router.get('/job-optimization/:id', validateUUIDParams('id'), getSingleOptimization);
router.delete('/job-optimization/:id', validateUUIDParams('id'), removeOptimization);

module.exports = router;
