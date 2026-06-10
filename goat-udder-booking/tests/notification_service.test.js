const NotificationService = require('../src/services/notification_service');
const NotificationRepository = require('../src/data/repositories/notification_repository');

// Mock the repository
const mockRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByBookingId: jest.fn(),
  findPending: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

jest.mock('../src/data/repositories/notification_repository', () => {
  return class NotificationRepository {
    constructor() {
      this.repository = mockRepository;
    }
    findAll() { return this.repository.findAll(); }
    findById(id) { return this.repository.findById(id); }
    findByUserId(userId) { return this.repository.findByUserId(userId); }
    findByBookingId(bookingId) { return this.repository.findByBookingId(bookingId); }
    findPending() { return this.repository.findPending(); }
    create(data) { return this.repository.create(data); }
    update(id, data) { return this.repository.update(id, data); }
  };
});

// Mock nodemailer
const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail,
  }),
}));

describe('NotificationService - Unit Tests', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService();
  });

  describe('getAllNotifications', () => {
    it('should return all notifications formatted', async () => {
      const mockNotifications = [
        { id: 1, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Booking confirmed', status: 'sent', sent_at: new Date(), created_at: new Date() },
        { id: 2, user_id: 2, booking_id: 2, type: 'payment_receipt', message: 'Payment received', status: 'pending', sent_at: null, created_at: new Date() },
      ];
      mockRepository.findAll.mockResolvedValue(mockNotifications);

      const result = await service.getAllNotifications();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        user_id: 1,
        booking_id: 1,
        type: 'booking_confirmation',
        message: 'Booking confirmed',
        status: 'sent',
        sent_at: mockNotifications[0].sent_at,
        created_at: mockNotifications[0].created_at,
      });
    });

    it('should return empty array when no notifications', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllNotifications();

      expect(result).toHaveLength(0);
    });
  });

  describe('getNotificationById', () => {
    it('should return notification by ID', async () => {
      const mockNotification = { id: 1, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Booking confirmed', status: 'sent', sent_at: new Date(), created_at: new Date() };
      mockRepository.findById.mockResolvedValue(mockNotification);

      const result = await service.getNotificationById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 1,
        user_id: 1,
        booking_id: 1,
        type: 'booking_confirmation',
        message: 'Booking confirmed',
        status: 'sent',
        sent_at: mockNotification.sent_at,
        created_at: mockNotification.created_at,
      });
    });

    it('should throw error for invalid ID', async () => {
      await expect(service.getNotificationById(null)).rejects.toThrow('Invalid notification ID');
      await expect(service.getNotificationById('abc')).rejects.toThrow('Invalid notification ID');
    });

    it('should throw error when notification not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getNotificationById(99)).rejects.toThrow('Notification with ID 99 not found');
    });
  });

  describe('getNotificationsByUserId', () => {
    it('should return notifications by user ID', async () => {
      const mockNotifications = [
        { id: 1, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Booking confirmed', status: 'sent', sent_at: new Date(), created_at: new Date() },
      ];
      mockRepository.findByUserId.mockResolvedValue(mockNotifications);

      const result = await service.getNotificationsByUserId(1);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });

    it('should throw error for invalid user ID', async () => {
      await expect(service.getNotificationsByUserId(null)).rejects.toThrow('Invalid user ID');
      await expect(service.getNotificationsByUserId('abc')).rejects.toThrow('Invalid user ID');
    });
  });

  describe('getNotificationsByBookingId', () => {
    it('should return notifications by booking ID', async () => {
      const mockNotifications = [
        { id: 3, user_id: 1, booking_id: 3, type: 'payment_receipt', message: 'Payment received', status: 'sent', sent_at: new Date(), created_at: new Date() },
      ];
      mockRepository.findByBookingId.mockResolvedValue(mockNotifications);

      const result = await service.getNotificationsByBookingId(3);

      expect(mockRepository.findByBookingId).toHaveBeenCalledWith(3);
      expect(result).toHaveLength(1);
    });

    it('should throw error for invalid booking ID', async () => {
      await expect(service.getNotificationsByBookingId(null)).rejects.toThrow('Invalid booking ID');
      await expect(service.getNotificationsByBookingId('abc')).rejects.toThrow('Invalid booking ID');
    });
  });

  describe('getPendingNotifications', () => {
    it('should return pending notifications', async () => {
      const mockNotifications = [
        { id: 4, user_id: 2, booking_id: 4, type: 'booking_confirmation', message: 'Pending booking', status: 'pending', sent_at: null, created_at: new Date() },
      ];
      mockRepository.findPending.mockResolvedValue(mockNotifications);

      const result = await service.getPendingNotifications();

      expect(mockRepository.findPending).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });
  });

  describe('sendBookingConfirmation', () => {
    it('should send booking confirmation successfully', async () => {
      const bookingData = {
        user_id: 1,
        booking_id: 1,
        user_email: 'user@example.com',
        pad_name: 'Pad Alpha',
        start_date: '2026-07-01',
        end_date: '2026-07-07',
        total_price: 150.00,
      };
      const createdNotification = { id: 5, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Booking confirmed', status: 'pending', sent_at: null, created_at: new Date() };
      const sentNotification = { ...createdNotification, status: 'sent', sent_at: new Date() };

      mockRepository.create.mockResolvedValue(createdNotification);
      mockRepository.update.mockResolvedValue(sentNotification);
      mockRepository.findById.mockResolvedValue(sentNotification);

      const result = await service.sendBookingConfirmation(bookingData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        user_id: 1,
        booking_id: 1,
        type: 'booking_confirmation',
        message: expect.stringContaining('Pad Alpha'),
      });
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'user@example.com',
        subject: 'Booking Confirmation',
        html: expect.stringContaining('Pad Alpha'),
      }));
      expect(mockRepository.update).toHaveBeenCalledWith(5, { status: 'sent', sent_at: expect.any(Date) });
      expect(result.status).toBe('sent');
    });

    it('should create notification even when email fails', async () => {
      const bookingData = {
        user_id: 1,
        booking_id: 1,
        user_email: 'user@example.com',
        pad_name: 'Pad Beta',
        start_date: '2026-07-01',
        end_date: '2026-07-03',
        total_price: 100.00,
      };
      const createdNotification = { id: 6, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Booking confirmed', status: 'pending', sent_at: null, created_at: new Date() };
      const sentNotification = { ...createdNotification, status: 'sent', sent_at: new Date() };

      mockRepository.create.mockResolvedValue(createdNotification);
      mockRepository.update.mockResolvedValue(sentNotification);
      mockRepository.findById.mockResolvedValue(sentNotification);
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      const result = await service.sendBookingConfirmation(bookingData);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(result.status).toBe('sent');
    });
  });

  describe('sendBookingCancellation', () => {
    it('should send booking cancellation successfully', async () => {
      const bookingData = {
        user_id: 1,
        booking_id: 2,
        user_email: 'user@example.com',
        pad_name: 'Pad Gamma',
        start_date: '2026-07-01',
        end_date: '2026-07-05',
      };
      const createdNotification = { id: 7, user_id: 1, booking_id: 2, type: 'booking_cancellation', message: 'Booking cancelled', status: 'pending', sent_at: null, created_at: new Date() };
      const sentNotification = { ...createdNotification, status: 'sent', sent_at: new Date() };

      mockRepository.create.mockResolvedValue(createdNotification);
      mockRepository.update.mockResolvedValue(sentNotification);
      mockRepository.findById.mockResolvedValue(sentNotification);

      const result = await service.sendBookingCancellation(bookingData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        user_id: 1,
        booking_id: 2,
        type: 'booking_cancellation',
        message: expect.stringContaining('Pad Gamma'),
      });
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'user@example.com',
        subject: 'Booking Cancellation',
      }));
      expect(result.status).toBe('sent');
    });
  });

  describe('sendPaymentReceipt', () => {
    it('should send payment receipt successfully', async () => {
      const paymentData = {
        user_id: 1,
        booking_id: 3,
        user_email: 'user@example.com',
        amount: 200.00,
        payment_method: 'credit_card',
        transaction_id: 'TXN-12345',
      };
      const createdNotification = { id: 8, user_id: 1, booking_id: 3, type: 'payment_receipt', message: 'Payment received', status: 'pending', sent_at: null, created_at: new Date() };
      const sentNotification = { ...createdNotification, status: 'sent', sent_at: new Date() };

      mockRepository.create.mockResolvedValue(createdNotification);
      mockRepository.update.mockResolvedValue(sentNotification);
      mockRepository.findById.mockResolvedValue(sentNotification);

      const result = await service.sendPaymentReceipt(paymentData);

      expect(mockRepository.create).toHaveBeenCalledWith({
        user_id: 1,
        booking_id: 3,
        type: 'payment_receipt',
        message: expect.stringContaining('TXN-12345'),
      });
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'user@example.com',
        subject: 'Payment Receipt',
      }));
      expect(result.status).toBe('sent');
    });
  });

  describe('sendNotification', () => {
    it('should send a general notification', async () => {
      const notificationData = {
        user_id: 1,
        booking_id: 4,
        type: 'general',
        message: 'Test notification',
        user_email: 'user@example.com',
      };
      const createdNotification = { id: 9, user_id: 1, booking_id: 4, type: 'general', message: 'Test notification', status: 'pending', sent_at: null, created_at: new Date() };
      const sentNotification = { ...createdNotification, status: 'sent', sent_at: new Date() };

      mockRepository.create.mockResolvedValue(createdNotification);
      mockRepository.update.mockResolvedValue(sentNotification);
      mockRepository.findById.mockResolvedValue(sentNotification);

      const result = await service.sendNotification(notificationData);

      expect(mockRepository.create).toHaveBeenCalledWith(notificationData);
      expect(mockSendMail).toHaveBeenCalled();
      expect(result.status).toBe('sent');
    });

    it('should not send email when user_email is not provided', async () => {
      const notificationData = {
        user_id: 1,
        booking_id: 5,
        type: 'general',
        message: 'Test notification',
      };
      const createdNotification = { id: 10, user_id: 1, booking_id: 5, type: 'general', message: 'Test notification', status: 'pending', sent_at: null, created_at: new Date() };

      mockRepository.create.mockResolvedValue(createdNotification);
      mockRepository.findById.mockResolvedValue(createdNotification);

      const result = await service.sendNotification(notificationData);

      expect(mockRepository.create).toHaveBeenCalledWith(notificationData);
      expect(mockSendMail).not.toHaveBeenCalled();
      expect(result.status).toBe('pending');
    });

    it('should throw error for invalid notification data - missing user_id', async () => {
      await expect(service.sendNotification({ booking_id: 1, type: 'general', message: 'Test' })).rejects.toThrow('Valid user_id is required');
    });

    it('should throw error for invalid notification data - missing type', async () => {
      await expect(service.sendNotification({ user_id: 1, booking_id: 1, message: 'Test' })).rejects.toThrow('Notification type is required');
    });

    it('should throw error for invalid notification data - missing message', async () => {
      await expect(service.sendNotification({ user_id: 1, booking_id: 1, type: 'general' })).rejects.toThrow('Notification message is required');
    });

    it('should throw error for whitespace message', async () => {
      await expect(service.sendNotification({ user_id: 1, booking_id: 1, type: 'general', message: '   ' })).rejects.toThrow('Notification message is required');
    });
  });

  describe('validateNotificationData', () => {
    it('should not throw for valid data', () => {
      expect(() => service.validateNotificationData({ user_id: 1, type: 'general', message: 'Test' })).not.toThrow();
    });

    it('should throw for missing user_id', () => {
      expect(() => service.validateNotificationData({ type: 'general', message: 'Test' })).toThrow('Valid user_id is required');
    });

    it('should throw for non-numeric user_id', () => {
      expect(() => service.validateNotificationData({ user_id: 'abc', type: 'general', message: 'Test' })).toThrow('Valid user_id is required');
    });

    it('should throw for missing type', () => {
      expect(() => service.validateNotificationData({ user_id: 1, message: 'Test' })).toThrow('Notification type is required');
    });

    it('should throw for empty type', () => {
      expect(() => service.validateNotificationData({ user_id: 1, type: '', message: 'Test' })).toThrow('Notification type is required');
    });

    it('should throw for missing message', () => {
      expect(() => service.validateNotificationData({ user_id: 1, type: 'general' })).toThrow('Notification message is required');
    });

    it('should throw for empty message', () => {
      expect(() => service.validateNotificationData({ user_id: 1, type: 'general', message: '' })).toThrow('Notification message is required');
    });
  });

  describe('formatNotification', () => {
    it('should format notification data correctly', () => {
      const notification = { id: 1, user_id: 1, booking_id: 1, type: 'booking_confirmation', message: 'Test', status: 'sent', sent_at: new Date(), created_at: new Date() };

      const result = service.formatNotification(notification);

      expect(result).toEqual({
        id: 1,
        user_id: 1,
        booking_id: 1,
        type: 'booking_confirmation',
        message: 'Test',
        status: 'sent',
        sent_at: notification.sent_at,
        created_at: notification.created_at,
      });
    });
  });

  describe('createEmailTransporter', () => {
    it('should create a nodemailer transporter with default config', () => {
      const result = service.createEmailTransporter();

      expect(result).toBeDefined();
      expect(result.sendMail).toBeDefined();
    });

    it('should use custom SMTP config from environment', () => {
      const originalSMTP_HOST = process.env.SMTP_HOST;
      const originalSMTP_PORT = process.env.SMTP_PORT;

      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '465';

      const newService = new NotificationService();
      const transporter = newService.createEmailTransporter();

      expect(transporter).toBeDefined();

      process.env.SMTP_HOST = originalSMTP_HOST;
      process.env.SMTP_PORT = originalSMTP_PORT;
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const result = await service.sendEmail('test@example.com', 'Test Subject', '<h1>Test</h1>');

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<h1>Test</h1>',
      }));
      expect(result).toEqual({ messageId: 'test-message-id' });
    });

    it('should return null when email fails', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      const result = await service.sendEmail('test@example.com', 'Test Subject', '<h1>Test</h1>');

      expect(result).toBeNull();
    });
  });
});
