const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { validateUUIDParams } = require('../middleware/validateParams');
const {
  submitApplication,
  getUserApplications,
  getUserApplicationById,
  checkJobApplicationStatus,
} = require('../controllers/application.controller');

const router = express.Router();

// All application routes require authenticated user
router.use(authMiddleware);

// Candidate application submission & retrieval
router.post('/', submitApplication);
router.get('/', getUserApplications);
router.get('/check/:jobId', validateUUIDParams('jobId'), checkJobApplicationStatus);
router.get('/:id', validateUUIDParams('id'), getUserApplicationById);

module.exports = router;
