const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUserPreferences,
  updateUserPreferences,
  generateSmartReminders,
} = require('../services/notificationService');

async function getNotifications(req, res, next) {
  try {
    const userId = req.user.userId;
    const { page, limit, unreadOnly } = req.query;

    // Trigger background smart reminder check lazily
    generateSmartReminders({ userId }).catch(() => {});

    const result = await getUserNotifications({
      userId,
      page,
      limit,
      unreadOnly: unreadOnly === 'true',
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

async function getUnreadCountHandler(req, res, next) {
  try {
    const userId = req.user.userId;
    const count = await getUnreadCount({ userId });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await markAsRead({ userId, notificationId: id });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    const userId = req.user.userId;

    const result = await markAllAsRead({ userId });

    res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

async function deleteNotif(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await deleteNotification({ userId, notificationId: id });

    res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

async function getPreferences(req, res, next) {
  try {
    const userId = req.user.userId;
    const preferences = await getUserPreferences({ userId });

    res.status(200).json({
      success: true,
      preferences,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

async function updatePreferences(req, res, next) {
  try {
    const userId = req.user.userId;
    const preferences = await updateUserPreferences({ userId, data: req.body });

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
}

module.exports = {
  getNotifications,
  getUnreadCountHandler,
  markRead,
  markAllRead,
  deleteNotif,
  getPreferences,
  updatePreferences,
};
