const express = require('express');
const {
  getNotifications,
  getUnreadCountHandler,
  markRead,
  markAllRead,
  deleteNotif,
  getPreferences,
  updatePreferences,
} = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { validateUUIDParams } = require('../middleware/validateParams');

const router = express.Router();

router.use(authMiddleware);

// Notifications Endpoints
router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadCountHandler);
router.patch('/notifications/read-all', markAllRead);
router.patch('/notifications/:id/read', validateUUIDParams('id'), markRead);
router.delete('/notifications/:id', validateUUIDParams('id'), deleteNotif);

// Preferences Endpoints
router.get('/notification-preferences', getPreferences);
router.put('/notification-preferences', updatePreferences);

module.exports = router;
