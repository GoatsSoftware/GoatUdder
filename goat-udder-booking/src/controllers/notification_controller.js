const NotificationService = require('../services/notification_service');

// Notification Controller - Web layer for notifications
class NotificationController {
  constructor() {
    this.service = new NotificationService();
  }

  // Get all notifications
  async getAllNotifications(req, res) {
    try {
      const notifications = await this.service.getAllNotifications();
      res.json({ success: true, data: notifications, count: notifications.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get notification by ID
  async getNotificationById(req, res) {
    try {
      const notification = await this.service.getNotificationById(req.params.id);
      res.json({ success: true, data: notification });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  // Get notifications by user ID
  async getNotificationsByUserId(req, res) {
    try {
      const notifications = await this.service.getNotificationsByUserId(req.params.userId);
      res.json({ success: true, data: notifications, count: notifications.length });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  // Get notifications by booking ID
  async getNotificationsByBookingId(req, res) {
    try {
      const notifications = await this.service.getNotificationsByBookingId(req.params.bookingId);
      res.json({ success: true, data: notifications, count: notifications.length });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  // Get pending notifications
  async getPendingNotifications(req, res) {
    try {
      const notifications = await this.service.getPendingNotifications();
      res.json({ success: true, data: notifications, count: notifications.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Send a booking confirmation notification
  async sendBookingConfirmation(req, res) {
    try {
      const notification = await this.service.sendBookingConfirmation(req.body);
      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Send a booking cancellation notification
  async sendBookingCancellation(req, res) {
    try {
      const notification = await this.service.sendBookingCancellation(req.body);
      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Send a payment receipt notification
  async sendPaymentReceipt(req, res) {
    try {
      const notification = await this.service.sendPaymentReceipt(req.body);
      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Send a general notification
  async sendNotification(req, res) {
    try {
      const notification = await this.service.sendNotification(req.body);
      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = NotificationController;