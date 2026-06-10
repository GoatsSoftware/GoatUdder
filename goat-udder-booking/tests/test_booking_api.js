const request = require('supertest');
const app = require('../src/index');

// Mock the controllers
const mockPaymentController = {
  getAllPayments: jest.fn().mockResolvedValue([{ id: 1, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'completed' }]),
  getPaymentById: jest.fn().mockResolvedValue({ id: 1, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'completed' }),
  getPaymentsByBookingId: jest.fn().mockResolvedValue([{ id: 1, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'completed' }]),
  getPendingPayments: jest.fn().mockResolvedValue([{ id: 2, booking_id: 2, amount: 50.00, payment_method: 'paypal', status: 'pending' }]),
  processPayment: jest.fn().mockResolvedValue({ id: 3, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'completed', transaction_id: 'TXN-123' }),
  cancelPayment: jest.fn().mockResolvedValue({ id: 2, booking_id: 2, amount: 50.00, payment_method: 'paypal', status: 'cancelled' }),
  refundPayment: jest.fn().mockResolvedValue({ id: 1, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'refunded' }),
};

const mockNotificationController = {
  getAllNotifications: jest.fn().mockResolvedValue([{ id: 1, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Booking confirmed', status: 'sent' }]),
  getNotificationById: jest.fn().mockResolvedValue({ id: 1, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Booking confirmed', status: 'sent' }),
  getNotificationsByUserId: jest.fn().mockResolvedValue([{ id: 1, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Booking confirmed', status: 'sent' }]),
  getNotificationsByBookingId: jest.fn().mockResolvedValue([{ id: 2, user_id: 1, booking_id: 1, type: 'payment_receipt', message: 'Payment received', status: 'sent' }]),
  getPendingNotifications: jest.fn().mockResolvedValue([{ id: 3, user_id: 2, booking_id: 2, type: 'booking_confirmation', message: 'Pending', status: 'pending' }]),
  sendBookingConfirmation: jest.fn().mockResolvedValue({ id: 4, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Booking confirmed', status: 'sent' }),
  sendBookingCancellation: jest.fn().mockResolvedValue({ id: 5, user_id: 1, booking_id: 2, type: 'booking_cancellation', message: 'Booking cancelled', status: 'sent' }),
  sendPaymentReceipt: jest.fn().mockResolvedValue({ id: 6, user_id: 1, booking_id: 1, type: 'payment_receipt', message: 'Payment received', status: 'sent' }),
  sendNotification: jest.fn().mockResolvedValue({ id: 7, user_id: 1, booking_id: 3, type: 'general', message: 'Test', status: 'sent' }),
};

jest.mock('../src/controllers/payment_controller', () => {
  return class PaymentController {
    constructor() {
      this.controller = mockPaymentController;
    }
    getAllPayments(req, res) { return this.controller.getAllPayments(req, res); }
    getPaymentById(req, res) { return this.controller.getPaymentById(req, res); }
    getPaymentsByBookingId(req, res) { return this.controller.getPaymentsByBookingId(req, res); }
    getPendingPayments(req, res) { return this.controller.getPendingPayments(req, res); }
    processPayment(req, res) { return this.controller.processPayment(req, res); }
    cancelPayment(req, res) { return this.controller.cancelPayment(req, res); }
    refundPayment(req, res) { return this.controller.refundPayment(req, res); }
  };
});

jest.mock('../src/controllers/notification_controller', () => {
  return class NotificationController {
    constructor() {
      this.controller = mockNotificationController;
    }
    getAllNotifications(req, res) { return this.controller.getAllNotifications(req, res); }
    getNotificationById(req, res) { return this.controller.getNotificationById(req, res); }
    getNotificationsByUserId(req, res) { return this.controller.getNotificationsByUserId(req, res); }
    getNotificationsByBookingId(req, res) { return this.controller.getNotificationsByBookingId(req, res); }
    getPendingNotifications(req, res) { return this.controller.getPendingNotifications(req, res); }
    sendBookingConfirmation(req, res) { return this.controller.sendBookingConfirmation(req, res); }
    sendBookingCancellation(req, res) { return this.controller.sendBookingCancellation(req, res); }
    sendPaymentReceipt(req, res) { return this.controller.sendPaymentReceipt(req, res); }
    sendNotification(req, res) { return this.controller.sendNotification(req, res); }
  };
});

describe('GoatUdder-Booking API - Mock Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'healthy', service: 'goat-udder-booking' });
    });
  });

  describe('GET /api/payments', () => {
    it('should return all payments', async () => {
      const response = await request(app).get('/api/payments');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(mockPaymentController.getAllPayments).toHaveBeenCalled();
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should return payment by ID', async () => {
      const response = await request(app).get('/api/payments/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'completed' });
      expect(mockPaymentController.getPaymentById).toHaveBeenCalled();
    });
  });

  describe('GET /api/payments/booking/:bookingId', () => {
    it('should return payments by booking ID', async () => {
      const response = await request(app).get('/api/payments/booking/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(mockPaymentController.getPaymentsByBookingId).toHaveBeenCalled();
    });
  });

  describe('GET /api/payments/pending', () => {
    it('should return pending payments', async () => {
      const response = await request(app).get('/api/payments/pending');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('pending');
      expect(mockPaymentController.getPendingPayments).toHaveBeenCalled();
    });
  });

  describe('POST /api/payments', () => {
    it('should process a payment', async () => {
      const paymentData = { booking_id: 1, amount: 100.00, payment_method: 'credit_card' };
      const response = await request(app).post('/api/payments').send(paymentData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 3, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'completed', transaction_id: 'TXN-123' });
      expect(mockPaymentController.processPayment).toHaveBeenCalled();
    });
  });

  describe('PUT /api/payments/:id/cancel', () => {
    it('should cancel a payment', async () => {
      const response = await request(app).put('/api/payments/2/cancel');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 2, booking_id: 2, amount: 50.00, payment_method: 'paypal', status: 'cancelled' });
      expect(mockPaymentController.cancelPayment).toHaveBeenCalled();
    });
  });

  describe('PUT /api/payments/:id/refund', () => {
    it('should refund a payment', async () => {
      const response = await request(app).put('/api/payments/1/refund');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'refunded' });
      expect(mockPaymentController.refundPayment).toHaveBeenCalled();
    });
  });

  describe('GET /api/notifications', () => {
    it('should return all notifications', async () => {
      const response = await request(app).get('/api/notifications');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(mockNotificationController.getAllNotifications).toHaveBeenCalled();
    });
  });

  describe('GET /api/notifications/:id', () => {
    it('should return notification by ID', async () => {
      const response = await request(app).get('/api/notifications/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Booking confirmed', status: 'sent' });
      expect(mockNotificationController.getNotificationById).toHaveBeenCalled();
    });
  });

  describe('GET /api/notifications/user/:userId', () => {
    it('should return notifications by user ID', async () => {
      const response = await request(app).get('/api/notifications/user/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(mockNotificationController.getNotificationsByUserId).toHaveBeenCalled();
    });
  });

  describe('GET /api/notifications/booking/:bookingId', () => {
    it('should return notifications by booking ID', async () => {
      const response = await request(app).get('/api/notifications/booking/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(mockNotificationController.getNotificationsByBookingId).toHaveBeenCalled();
    });
  });

  describe('GET /api/notifications/pending', () => {
    it('should return pending notifications', async () => {
      const response = await request(app).get('/api/notifications/pending');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe('pending');
      expect(mockNotificationController.getPendingNotifications).toHaveBeenCalled();
    });
  });

  describe('POST /api/notifications/booking-confirmation', () => {
    it('should send booking confirmation', async () => {
      const bookingData = { user_id: 1, booking_id: 1, user_email: 'user@example.com', pad_name: 'Pad Alpha', start_date: '2026-07-01', end_date: '2026-07-07', total_price: 150.00 };
      const response = await request(app).post('/api/notifications/booking-confirmation').send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 4, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Booking confirmed', status: 'sent' });
      expect(mockNotificationController.sendBookingConfirmation).toHaveBeenCalled();
    });
  });

  describe('POST /api/notifications/booking-cancellation', () => {
    it('should send booking cancellation', async () => {
      const bookingData = { user_id: 1, booking_id: 2, user_email: 'user@example.com', pad_name: 'Pad Beta', start_date: '2026-07-01', end_date: '2026-07-05' };
      const response = await request(app).post('/api/notifications/booking-cancellation').send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 5, user_id: 1, booking_id: 2, type: 'booking_cancellation', message: 'Booking cancelled', status: 'sent' });
      expect(mockNotificationController.sendBookingCancellation).toHaveBeenCalled();
    });
  });

  describe('POST /api/notifications/payment-receipt', () => {
    it('should send payment receipt', async () => {
      const paymentData = { user_id: 1, booking_id: 1, user_email: 'user@example.com', amount: 200.00, payment_method: 'credit_card', transaction_id: 'TXN-12345' };
      const response = await request(app).post('/api/notifications/payment-receipt').send(paymentData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 6, user_id: 1, booking_id: 1, type: 'payment_receipt', message: 'Payment received', status: 'sent' });
      expect(mockNotificationController.sendPaymentReceipt).toHaveBeenCalled();
    });
  });

  describe('POST /api/notifications', () => {
    it('should send a general notification', async () => {
      const notificationData = { user_id: 1, booking_id: 3, type: 'general', message: 'Test notification', user_email: 'user@example.com' };
      const response = await request(app).post('/api/notifications').send(notificationData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 7, user_id: 1, booking_id: 3, type: 'general', message: 'Test', status: 'sent' });
      expect(mockNotificationController.sendNotification).toHaveBeenCalled();
    });
  });
});