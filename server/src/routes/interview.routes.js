const express = require('express');
const {
  startInterview,
  submitAnswer,
  getInterviews,
  getInterviewById,
  abandonInterview,
} = require('../controllers/interview.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { validateUUIDParams } = require('../middleware/validateParams');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authMiddleware);

// AI Mock Interview Routes
router.post('/interviews', aiRateLimiter, startInterview);
router.get('/interviews', getInterviews);
router.get('/interviews/:id', validateUUIDParams('id'), getInterviewById);
router.post('/interviews/:sessionId/questions/:questionId/answer', validateUUIDParams('sessionId', 'questionId'), aiRateLimiter, submitAnswer);
router.post('/interviews/:sessionId/abandon', validateUUIDParams('sessionId'), abandonInterview);

module.exports = router;
