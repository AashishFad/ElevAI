const express = require('express');
const multer = require('multer');
const {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
  getResumeDownloadUrl,
} = require('../controllers/resume.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { validateUUIDParams } = require('../middleware/validateParams');

const router = express.Router();

// Multer memory storage configuration (5MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// All resume endpoints require JWT authentication
router.use(authMiddleware);

router.post('/', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', validateUUIDParams('id'), getResumeById);
router.delete('/:id', validateUUIDParams('id'), deleteResume);
router.get('/:id/download', validateUUIDParams('id'), getResumeDownloadUrl);

module.exports = router;
