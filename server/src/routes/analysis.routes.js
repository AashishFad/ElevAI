const express = require('express');
const {
  analyzeResume,
  getAnalyses,
  getSingleAnalysis,
} = require('../controllers/analysis.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { validateUUIDParams } = require('../middleware/validateParams');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authMiddleware);

// Resume Analysis Endpoints
router.post('/resumes/:resumeId/analyze', validateUUIDParams('resumeId'), aiRateLimiter, analyzeResume);
router.get('/resumes/:resumeId/analyses', validateUUIDParams('resumeId'), getAnalyses);
router.get('/analyses/:analysisId', validateUUIDParams('analysisId'), getSingleAnalysis);

module.exports = router;
