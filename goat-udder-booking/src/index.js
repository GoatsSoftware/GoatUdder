const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./data/database');
const PaymentController = require('./controllers/payment_controller');
const NotificationController = require('./controllers/notification_controller');

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Controllers instances
const paymentController = new PaymentController();
const notificationController = new NotificationController();

// Routes - Payments
app.get('/api/payments', paymentController.getAllPayments.bind(paymentController));
app.get('/api/payments/:id', paymentController.getPaymentById.bind(paymentController));
app.get('/api/payments/booking/:bookingId', paymentController.getPaymentsByBookingId.bind(paymentController));
app.get('/api/payments/pending', paymentController.getPendingPayments.bind(paymentController));
app.post('/api/payments', paymentController.processPayment.bind(paymentController));
app.put('/api/payments/:id/cancel', paymentController.cancelPayment.bind(paymentController));
app.put('/api/payments/:id/refund', paymentController.refundPayment.bind(paymentController));

// Routes - Notifications
app.get('/api/notifications', notificationController.getAllNotifications.bind(notificationController));
app.get('/api/notifications/:id', notificationController.getNotificationById.bind(notificationController));
app.get('/api/notifications/user/:userId', notificationController.getNotificationsByUserId.bind(notificationController));
app.get('/api/notifications/booking/:bookingId', notificationController.getNotificationsByBookingId.bind(notificationController));
app.get('/api/notifications/pending', notificationController.getPendingNotifications.bind(notificationController));
app.post('/api/notifications/booking-confirmation', notificationController.sendBookingConfirmation.bind(notificationController));
app.post('/api/notifications/booking-cancellation', notificationController.sendBookingCancellation.bind(notificationController));
app.post('/api/notifications/payment-receipt', notificationController.sendPaymentReceipt.bind(notificationController));
app.post('/api/notifications', notificationController.sendNotification.bind(notificationController));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'goat-udder-booking' });
});

// Start server
async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`GoatUdder Booking running on port ${PORT}`);
  });
}

// Only start server when run directly
if (require.main === module) {
  start();
}

module.exports = app;