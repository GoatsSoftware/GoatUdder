const NotificationRepository = require('../data/repositories/notification_repository');
const nodemailer = require('nodemailer');

// Notification Service - Business logic for notifications
class NotificationService {
  constructor() {
    this.repository = new NotificationRepository();
    this.emailTransporter = this.createEmailTransporter();
  }

  // Create email transporter
  createEmailTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'goatudder',
        pass: process.env.SMTP_PASS || 'goatudder',
      },
    });
  }

  // Get all notifications
  async getAllNotifications() {
    const notifications = await this.repository.findAll();
    return notifications.map(notification => this.formatNotification(notification));
  }

  // Get notification by ID
  async getNotificationById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid notification ID');
    }
    const notification = await this.repository.findById(id);
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    return this.formatNotification(notification);
  }

  // Get notifications by user ID
  async getNotificationsByUserId(userId) {
    if (!userId || isNaN(userId)) {
      throw new Error('Invalid user ID');
    }
    const notifications = await this.repository.findByUserId(userId);
    return notifications.map(notification => this.formatNotification(notification));
  }

  // Get notifications by booking ID
  async getNotificationsByBookingId(bookingId) {
    if (!bookingId || isNaN(bookingId)) {
      throw new Error('Invalid booking ID');
    }
    const notifications = await this.repository.findByBookingId(bookingId);
    return notifications.map(notification => this.formatNotification(notification));
  }

  // Get pending notifications
  async getPendingNotifications() {
    const notifications = await this.repository.findPending();
    return notifications.map(notification => this.formatNotification(notification));
  }

  // Send a booking confirmation notification
  async sendBookingConfirmation(bookingData) {
    const { user_id, booking_id, user_email, pad_name, start_date, end_date, total_price } = bookingData;

    const notification = await this.repository.create({
      user_id,
      booking_id,
      type: 'booking_confirmation',
      message: `Your booking at "${pad_name}" from ${start_date} to ${end_date} has been confirmed. Total price: $${total_price}`,
    });

    // Send email
    await this.sendEmail(user_email, 'Booking Confirmation', `
      <h1>Booking Confirmation</h1>
      <p>Your booking at "${pad_name}" has been confirmed!</p>
      <ul>
        <li><strong>Start Date:</strong> ${start_date}</li>
        <li><strong>End Date:</strong> ${end_date}</li>
        <li><strong>Total Price:</strong> $${total_price}</li>
      </ul>
      <p>Thank you for choosing GoatUdder!</p>
    `);

    // Update notification status
    await this.repository.update(notification.id, {
      status: 'sent',
      sent_at: new Date(),
    });

    return this.formatNotification(await this.repository.findById(notification.id));
  }

  // Send a booking cancellation notification
  async sendBookingCancellation(bookingData) {
    const { user_id, booking_id, user_email, pad_name, start_date, end_date } = bookingData;

    const notification = await this.repository.create({
      user_id,
      booking_id,
      type: 'booking_cancellation',
      message: `Your booking at "${pad_name}" from ${start_date} to ${end_date} has been cancelled.`,
    });

    // Send email
    await this.sendEmail(user_email, 'Booking Cancellation', `
      <h1>Booking Cancellation</h1>
      <p>Your booking at "${pad_name}" has been cancelled.</p>
      <ul>
        <li><strong>Start Date:</strong> ${start_date}</li>
        <li><strong>End Date:</strong> ${end_date}</li>
      </ul>
      <p>If you have any questions, please contact us.</p>
    `);

    // Update notification status
    await this.repository.update(notification.id, {
      status: 'sent',
      sent_at: new Date(),
    });

    return this.formatNotification(await this.repository.findById(notification.id));
  }

  // Send a payment receipt notification
  async sendPaymentReceipt(paymentData) {
    const { user_id, booking_id, user_email, amount, payment_method, transaction_id } = paymentData;

    const notification = await this.repository.create({
      user_id,
      booking_id,
      type: 'payment_receipt',
      message: `Payment of $${amount} via ${payment_method} has been processed. Transaction ID: ${transaction_id}`,
    });

    // Send email
    await this.sendEmail(user_email, 'Payment Receipt', `
      <h1>Payment Receipt</h1>
      <p>Your payment has been processed successfully!</p>
      <ul>
        <li><strong>Amount:</strong> $${amount}</li>
        <li><strong>Payment Method:</strong> ${payment_method}</li>
        <li><strong>Transaction ID:</strong> ${transaction_id}</li>
      </ul>
      <p>Thank you for your payment!</p>
    `);

    // Update notification status
    await this.repository.update(notification.id, {
      status: 'sent',
      sent_at: new Date(),
    });

    return this.formatNotification(await this.repository.findById(notification.id));
  }

  // Send a general notification
  async sendNotification(notificationData) {
    this.validateNotificationData(notificationData);

    const notification = await this.repository.create(notificationData);

    // Send email if user_email is provided
    if (notificationData.user_email) {
      await this.sendEmail(
        notificationData.user_email,
        notificationData.type === 'booking_confirmation' ? 'Booking Confirmation' :
        notificationData.type === 'booking_cancellation' ? 'Booking Cancellation' :
        notificationData.type === 'payment_receipt' ? 'Payment Receipt' : 'Notification',
        `<h1>${notificationData.type}</h1><p>${notificationData.message}</p>`
      );

      // Update notification status
      await this.repository.update(notification.id, {
        status: 'sent',
        sent_at: new Date(),
      });
    }

    return this.formatNotification(await this.repository.findById(notification.id));
  }

  // Validate notification data
  validateNotificationData(notificationData) {
    if (!notificationData.user_id || isNaN(notificationData.user_id)) {
      throw new Error('Valid user_id is required');
    }
    if (!notificationData.type || notificationData.type.trim() === '') {
      throw new Error('Notification type is required');
    }
    if (!notificationData.message || notificationData.message.trim() === '') {
      throw new Error('Notification message is required');
    }
  }

  // Send email
  async sendEmail(to, subject, htmlBody) {
    try {
      const info = await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'goatudder@goatudder.com',
        to,
        subject,
        html: htmlBody,
      });
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email sending error:', error);
      // Don't throw error - notification is still recorded
      return null;
    }
  }

  // Format notification data for response
  formatNotification(notification) {
    return {
      id: notification.id,
      user_id: notification.user_id,
      booking_id: notification.booking_id,
      type: notification.type,
      message: notification.message,
      status: notification.status,
      sent_at: notification.sent_at,
      created_at: notification.created_at,
    };
  }
}

module.exports = NotificationService;