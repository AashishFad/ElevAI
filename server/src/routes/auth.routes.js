const express = require('express');
const { register, login, getMe, logout } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/me', authMiddleware, getMe);
router.post('/logout', logout);

module.exports = router;
