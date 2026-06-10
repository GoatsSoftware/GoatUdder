const PaymentService = require('../services/payment_service');

// Payment Controller - Web layer for payments
class PaymentController {
  constructor() {
    this.service = new PaymentService();
  }

  // Get all payments
  async getAllPayments(req, res) {
    try {
      const payments = await this.service.getAllPayments();
      res.json({ success: true, data: payments, count: payments.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get payment by ID
  async getPaymentById(req, res) {
    try {
      const payment = await this.service.getPaymentById(req.params.id);
      res.json({ success: true, data: payment });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  // Get payments by booking ID
  async getPaymentsByBookingId(req, res) {
    try {
      const payments = await this.service.getPaymentsByBookingId(req.params.bookingId);
      res.json({ success: true, data: payments, count: payments.length });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  // Get pending payments
  async getPendingPayments(req, res) {
    try {
      const payments = await this.service.getPendingPayments();
      res.json({ success: true, data: payments, count: payments.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Process a payment
  async processPayment(req, res) {
    try {
      const payment = await this.service.processPayment(req.body);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Cancel a payment
  async cancelPayment(req, res) {
    try {
      const payment = await this.service.cancelPayment(req.params.id);
      res.json({ success: true, data: payment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Refund a payment
  async refundPayment(req, res) {
    try {
      const payment = await this.service.refundPayment(req.params.id);
      res.json({ success: true, data: payment });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = PaymentController;