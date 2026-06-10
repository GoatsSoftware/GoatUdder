const { query } = require('../database');

// Notification Repository - Data access for notifications
class NotificationRepository {
  // Get all notifications
  async findAll() {
    const result = await query('SELECT * FROM notifications ORDER BY created_at DESC');
    return result.rows;
  }

  // Get notification by ID
  async findById(id) {
    const result = await query('SELECT * FROM notifications WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Get notifications by user ID
  async findByUserId(userId) {
    const result = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  // Get notifications by booking ID
  async findByBookingId(bookingId) {
    const result = await query('SELECT * FROM notifications WHERE booking_id = $1 ORDER BY created_at DESC', [bookingId]);
    return result.rows;
  }

  // Get pending notifications
  async findPending() {
    const result = await query('SELECT * FROM notifications WHERE status = $1 ORDER BY created_at ASC', ['pending']);
    return result.rows;
  }

  // Create a new notification
  async create(notificationData) {
    const { user_id, booking_id, type, message } = notificationData;
    const result = await query(
      'INSERT INTO notifications (user_id, booking_id, type, message, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, booking_id, type, message, 'pending']
    );
    return result.rows[0];
  }

  // Update a notification
  async update(id, notificationData) {
    const { status, sent_at } = notificationData;
    const result = await query(
      'UPDATE notifications SET status = $1, sent_at = $2 WHERE id = $3 RETURNING *',
      [status, sent_at, id]
    );
    return result.rows[0] || null;
  }

  // Delete a notification
  async delete(id) {
    await query('DELETE FROM notifications WHERE id = $1', [id]);
    return true;
  }
}

module.exports = NotificationRepository;