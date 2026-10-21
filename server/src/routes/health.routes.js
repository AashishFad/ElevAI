const express = require('express');
const { getHealth, getAIStatus } = require('../controllers/health.controller');

const router = express.Router();

router.get('/', getHealth);
router.get('/ai-status', getAIStatus);

module.exports = router;
