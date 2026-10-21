const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const careerGoalRoutes = require('./careerGoal.routes');
const resumeRoutes = require('./resume.routes');
const analysisRoutes = require('./analysis.routes');
const jobOptimizationRoutes = require('./jobOptimization.routes');
const interviewRoutes = require('./interview.routes');
const notificationRoutes = require('./notification.routes');
const adminRoutes = require('./admin.routes');
const jobRoutes = require('./job.routes');
const applicationRoutes = require('./application.routes');

const router = express.Router();

// Mount core recruitment routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/career-goal', careerGoalRoutes);
router.use('/resumes', resumeRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/admin', adminRoutes);
router.use('/', analysisRoutes);
router.use('/', jobOptimizationRoutes);
router.use('/', interviewRoutes);
router.use('/', notificationRoutes);

module.exports = router;
