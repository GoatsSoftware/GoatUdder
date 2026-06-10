const { query } = require('../database');

// Payment Repository - Data access for payments
class PaymentRepository {
  // Get all payments
  async findAll() {
    const result = await query('SELECT * FROM payments ORDER BY created_at DESC');
    return result.rows;
  }

  // Get payment by ID
  async findById(id) {
    const result = await query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Get payments by booking ID
  async findByBookingId(bookingId) {
    const result = await query('SELECT * FROM payments WHERE booking_id = $1 ORDER BY created_at DESC', [bookingId]);
    return result.rows;
  }

  // Get pending payments
  async findPending() {
    const result = await query('SELECT * FROM payments WHERE status = $1 ORDER BY created_at ASC', ['pending']);
    return result.rows;
  }

  // Create a new payment
  async create(paymentData) {
    const { booking_id, amount, payment_method } = paymentData;
    const result = await query(
      'INSERT INTO payments (booking_id, amount, payment_method, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [booking_id, amount, payment_method, 'pending']
    );
    return result.rows[0];
  }

  // Update a payment
  async update(id, paymentData) {
    const { status, transaction_id } = paymentData;
    const result = await query(
      'UPDATE payments SET status = $1, transaction_id = $2 WHERE id = $3 RETURNING *',
      [status, transaction_id, id]
    );
    return result.rows[0] || null;
  }

  // Delete a payment
  async delete(id) {
    await query('DELETE FROM payments WHERE id = $1', [id]);
    return true;
  }
}

module.exports = PaymentRepository;