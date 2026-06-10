const PaymentRepository = require('../data/repositories/payment_repository');

// Payment Service - Business logic for payments
class PaymentService {
  constructor() {
    this.repository = new PaymentRepository();
  }

  // Get all payments
  async getAllPayments() {
    const payments = await this.repository.findAll();
    return payments.map(payment => this.formatPayment(payment));
  }

  // Get payment by ID
  async getPaymentById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid payment ID');
    }
    const payment = await this.repository.findById(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    return this.formatPayment(payment);
  }

  // Get payments by booking ID
  async getPaymentsByBookingId(bookingId) {
    if (!bookingId || isNaN(bookingId)) {
      throw new Error('Invalid booking ID');
    }
    const payments = await this.repository.findByBookingId(bookingId);
    return payments.map(payment => this.formatPayment(payment));
  }

  // Get pending payments
  async getPendingPayments() {
    const payments = await this.repository.findPending();
    return payments.map(payment => this.formatPayment(payment));
  }

  // Process a payment
  async processPayment(paymentData) {
    this.validatePaymentData(paymentData);

    const payment = await this.repository.create(paymentData);

    // Simulate payment processing
    const processedPayment = await this.repository.update(payment.id, {
      status: 'completed',
      transaction_id: this.generateTransactionId(),
    });

    return this.formatPayment(processedPayment);
  }

  // Cancel a payment
  async cancelPayment(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid payment ID');
    }
    const existingPayment = await this.repository.findById(id);
    if (!existingPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    if (existingPayment.status === 'completed') {
      throw new Error('Cannot cancel a completed payment');
    }

    const updatedPayment = await this.repository.update(id, { status: 'cancelled' });
    return this.formatPayment(updatedPayment);
  }

  // Refund a payment
  async refundPayment(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid payment ID');
    }
    const existingPayment = await this.repository.findById(id);
    if (!existingPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    if (existingPayment.status !== 'completed') {
      throw new Error('Only completed payments can be refunded');
    }

    const updatedPayment = await this.repository.update(id, { status: 'refunded' });
    return this.formatPayment(updatedPayment);
  }

  // Validate payment data
  validatePaymentData(paymentData) {
    if (!paymentData.booking_id || isNaN(paymentData.booking_id)) {
      throw new Error('Valid booking_id is required');
    }
    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error('Payment amount must be a positive number');
    }
    if (!paymentData.payment_method || paymentData.payment_method.trim() === '') {
      throw new Error('Payment method is required');
    }
  }

  // Generate transaction ID
  generateTransactionId() {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Format payment data for response
  formatPayment(payment) {
    return {
      id: payment.id,
      booking_id: payment.booking_id,
      amount: parseFloat(payment.amount),
      payment_method: payment.payment_method,
      status: payment.status,
      transaction_id: payment.transaction_id,
      created_at: payment.created_at,
    };
  }
}

module.exports = PaymentService;