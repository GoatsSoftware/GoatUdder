const PaymentService = require('../src/services/payment_service');
const PaymentRepository = require('../src/data/repositories/payment_repository');

// Mock the repository
const mockRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByBookingId: jest.fn(),
  findPending: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

jest.mock('../src/data/repositories/payment_repository', () => {
  return class PaymentRepository {
    constructor() {
      this.repository = mockRepository;
    }
    findAll() { return this.repository.findAll(); }
    findById(id) { return this.repository.findById(id); }
    findByBookingId(bookingId) { return this.repository.findByBookingId(bookingId); }
    findPending() { return this.repository.findPending(); }
    create(data) { return this.repository.create(data); }
    update(id, data) { return this.repository.update(id, data); }
  };
});

describe('PaymentService - Unit Tests', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentService();
  });

  describe('getAllPayments', () => {
    it('should return all payments formatted', async () => {
      const mockPayments = [
        { id: 1, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'completed', transaction_id: 'TXN-1', created_at: new Date() },
        { id: 2, booking_id: 2, amount: 50.00, payment_method: 'paypal', status: 'pending', transaction_id: null, created_at: new Date() },
      ];
      mockRepository.findAll.mockResolvedValue(mockPayments);

      const result = await service.getAllPayments();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        booking_id: 1,
        amount: 100.00,
        payment_method: 'credit_card',
        status: 'completed',
        transaction_id: 'TXN-1',
        created_at: mockPayments[0].created_at,
      });
    });

    it('should return empty array when no payments', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllPayments();

      expect(result).toHaveLength(0);
    });
  });

  describe('getPaymentById', () => {
    it('should return payment by ID', async () => {
      const mockPayment = { id: 1, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'completed', transaction_id: 'TXN-1', created_at: new Date() };
      mockRepository.findById.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 1,
        booking_id: 1,
        amount: 100.00,
        payment_method: 'credit_card',
        status: 'completed',
        transaction_id: 'TXN-1',
        created_at: mockPayment.created_at,
      });
    });

    it('should throw error for invalid ID', async () => {
      await expect(service.getPaymentById(null)).rejects.toThrow('Invalid payment ID');
      await expect(service.getPaymentById('abc')).rejects.toThrow('Invalid payment ID');
    });

    it('should throw error when payment not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getPaymentById(99)).rejects.toThrow('Payment with ID 99 not found');
    });
  });

  describe('getPaymentsByBookingId', () => {
    it('should return payments by booking ID', async () => {
      const mockPayments = [
        { id: 1, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'completed', transaction_id: 'TXN-1', created_at: new Date() },
      ];
      mockRepository.findByBookingId.mockResolvedValue(mockPayments);

      const result = await service.getPaymentsByBookingId(1);

      expect(mockRepository.findByBookingId).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });

    it('should throw error for invalid booking ID', async () => {
      await expect(service.getPaymentsByBookingId(null)).rejects.toThrow('Invalid booking ID');
      await expect(service.getPaymentsByBookingId('abc')).rejects.toThrow('Invalid booking ID');
    });
  });

  describe('getPendingPayments', () => {
    it('should return pending payments', async () => {
      const mockPayments = [
        { id: 3, booking_id: 3, amount: 75.00, payment_method: 'bank_transfer', status: 'pending', transaction_id: null, created_at: new Date() },
      ];
      mockRepository.findPending.mockResolvedValue(mockPayments);

      const result = await service.getPendingPayments();

      expect(mockRepository.findPending).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });
  });

  describe('processPayment', () => {
    it('should process a payment successfully', async () => {
      const paymentData = { booking_id: 1, amount: 100.00, payment_method: 'credit_card' };
      const createdPayment = { id: 5, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'pending', transaction_id: null, created_at: new Date() };
      const updatedPayment = { ...createdPayment, status: 'completed', transaction_id: 'TXN-1234567890-abc123def' };

      mockRepository.create.mockResolvedValue(createdPayment);
      mockRepository.update.mockResolvedValue(updatedPayment);

      const result = await service.processPayment(paymentData);

      expect(mockRepository.create).toHaveBeenCalledWith(paymentData);
      expect(mockRepository.update).toHaveBeenCalledWith(5, { status: 'completed', transaction_id: expect.stringMatching(/^TXN-/) });
      expect(result.status).toBe('completed');
      expect(result.transaction_id).toMatch(/^TXN-/);
    });

    it('should throw error for invalid payment data - missing booking_id', async () => {
      await expect(service.processPayment({ amount: 100.00, payment_method: 'credit_card' })).rejects.toThrow('Valid booking_id is required');
    });

    it('should throw error for invalid payment data - negative amount', async () => {
      await expect(service.processPayment({ booking_id: 1, amount: -10, payment_method: 'credit_card' })).rejects.toThrow('Payment amount must be a positive number');
    });

    it('should throw error for invalid payment data - zero amount', async () => {
      await expect(service.processPayment({ booking_id: 1, amount: 0, payment_method: 'credit_card' })).rejects.toThrow('Payment amount must be a positive number');
    });

    it('should throw error for invalid payment data - missing payment_method', async () => {
      await expect(service.processPayment({ booking_id: 1, amount: 100.00, payment_method: '' })).rejects.toThrow('Payment method is required');
    });
  });

  describe('cancelPayment', () => {
    it('should cancel a pending payment', async () => {
      const existingPayment = { id: 3, booking_id: 3, amount: 75.00, payment_method: 'bank_transfer', status: 'pending', transaction_id: null, created_at: new Date() };
      const cancelledPayment = { ...existingPayment, status: 'cancelled' };

      mockRepository.findById.mockResolvedValue(existingPayment);
      mockRepository.update.mockResolvedValue(cancelledPayment);

      const result = await service.cancelPayment(3);

      expect(mockRepository.findById).toHaveBeenCalledWith(3);
      expect(mockRepository.update).toHaveBeenCalledWith(3, { status: 'cancelled' });
      expect(result.status).toBe('cancelled');
    });

    it('should throw error when trying to cancel completed payment', async () => {
      const completedPayment = { id: 1, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'completed', transaction_id: 'TXN-1', created_at: new Date() };

      mockRepository.findById.mockResolvedValue(completedPayment);

      await expect(service.cancelPayment(1)).rejects.toThrow('Cannot cancel a completed payment');
    });

    it('should throw error when payment not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.cancelPayment(99)).rejects.toThrow('Payment with ID 99 not found');
    });

    it('should throw error for invalid ID', async () => {
      await expect(service.cancelPayment(null)).rejects.toThrow('Invalid payment ID');
    });
  });

  describe('refundPayment', () => {
    it('should refund a completed payment', async () => {
      const completedPayment = { id: 1, booking_id: 1, amount: 100.00, payment_method: 'credit_card', status: 'completed', transaction_id: 'TXN-1', created_at: new Date() };
      const refundedPayment = { ...completedPayment, status: 'refunded' };

      mockRepository.findById.mockResolvedValue(completedPayment);
      mockRepository.update.mockResolvedValue(refundedPayment);

      const result = await service.refundPayment(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, { status: 'refunded' });
      expect(result.status).toBe('refunded');
    });

    it('should throw error when trying to refund pending payment', async () => {
      const pendingPayment = { id: 3, booking_id: 3, amount: 75.00, payment_method: 'bank_transfer', status: 'pending', transaction_id: null, created_at: new Date() };

      mockRepository.findById.mockResolvedValue(pendingPayment);

      await expect(service.refundPayment(3)).rejects.toThrow('Only completed payments can be refunded');
    });

    it('should throw error when payment not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.refundPayment(99)).rejects.toThrow('Payment with ID 99 not found');
    });

    it('should throw error for invalid ID', async () => {
      await expect(service.refundPayment(null)).rejects.toThrow('Invalid payment ID');
    });
  });

  describe('validatePaymentData', () => {
    it('should not throw for valid data', () => {
      expect(() => service.validatePaymentData({ booking_id: 1, amount: 100.00, payment_method: 'credit_card' })).not.toThrow();
    });

    it('should throw for missing booking_id', () => {
      expect(() => service.validatePaymentData({ amount: 100.00, payment_method: 'credit_card' })).toThrow('Valid booking_id is required');
    });

    it('should throw for non-numeric booking_id', () => {
      expect(() => service.validatePaymentData({ booking_id: 'abc', amount: 100.00, payment_method: 'credit_card' })).toThrow('Valid booking_id is required');
    });

    it('should throw for zero amount', () => {
      expect(() => service.validatePaymentData({ booking_id: 1, amount: 0, payment_method: 'credit_card' })).toThrow('Payment amount must be a positive number');
    });

    it('should throw for negative amount', () => {
      expect(() => service.validatePaymentData({ booking_id: 1, amount: -50, payment_method: 'credit_card' })).toThrow('Payment amount must be a positive number');
    });

    it('should throw for empty payment_method', () => {
      expect(() => service.validatePaymentData({ booking_id: 1, amount: 100.00, payment_method: '' })).toThrow('Payment method is required');
    });

    it('should throw for whitespace payment_method', () => {
      expect(() => service.validatePaymentData({ booking_id: 1, amount: 100.00, payment_method: '   ' })).toThrow('Payment method is required');
    });
  });

  describe('generateTransactionId', () => {
    it('should generate a transaction ID with TXN prefix', () => {
      const result = service.generateTransactionId();

      expect(result).toMatch(/^TXN-\d+-[a-z0-9]{9}$/);
    });
  });

  describe('formatPayment', () => {
    it('should format payment data correctly', () => {
      const payment = { id: 1, booking_id: 1, amount: '100.00', payment_method: 'credit_card', status: 'completed', transaction_id: 'TXN-1', created_at: new Date() };

      const result = service.formatPayment(payment);

      expect(result).toEqual({
        id: 1,
        booking_id: 1,
        amount: 100.00,
        payment_method: 'credit_card',
        status: 'completed',
        transaction_id: 'TXN-1',
        created_at: payment.created_at,
      });
      expect(typeof result.amount).toBe('number');
    });
  });
});