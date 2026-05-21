'use strict';

const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.findByUser(req.user.id);
    const unread = await Notification.unreadCount(req.user.id);
    res.json({ success: true, count: notifications.length, unread, notifications });
  } catch (error) {
    next(error);
  }
};

exports.markMyNotificationsRead = async (req, res, next) => {
  try {
    await Notification.markAllRead(req.user.id);
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
