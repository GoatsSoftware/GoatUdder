const { query } = require("../database");

// Booking Repository - Database operations for bookings
class BookingRepository {
  // Get all bookings
  async findAll() {
    const result = await query(`
      SELECT b.*, p.name as udder_name, p.location as udder_location, 
               u.username as user_name
       FROM bookings b
       JOIN udder p ON b.udder_id = p.id
       JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);
    return result.rows;
  }

  // Get booking by ID
  async findById(id) {
    const result = await query(
      `
      SELECT b.*, p.name as udder_name, p.location as udder_location, 
               p.price_per_day, p.capacity, p.status as udder_status,
               u.username as user_name, u.email as user_email
       FROM bookings b
       JOIN udder p ON b.udder_id = p.id
       JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `,
      [id],
    );
    return result.rows[0] || null;
  }

  // Get bookings by user ID
  async findByUserId(userId) {
    const result = await query(
      `
      SELECT b.*, p.name as udder_name, p.location as udder_location, 
               p.price_per_day, p.status as udder_status
       FROM bookings b
       JOIN udder p ON b.udder_id = p.id
       WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `,
      [userId],
    );
    return result.rows;
  }

  // Get bookings by udder ID
  async findByUdderId(udderId) {
    const result = await query(
      `
      SELECT b.*, u.username as user_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.udder_id = $1
      ORDER BY b.created_at DESC
    `,
      [udderId],
    );
    return result.rows;
  }

  // Get active bookings
  async findActive() {
    const result = await query(
      "SELECT * FROM bookings WHERE status = $1 ORDER BY created_at DESC",
      ["active"],
    );
    return result.rows;
  }

  // Create a new booking
  async create(bookingData) {
    const { udder_id, user_id, start_date, end_date, total_price, status } =
      bookingData;
    const result = await query(
      "INSERT INTO bookings (udder_id, user_id, start_date, end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [udder_id, user_id, start_date, end_date, total_price, status || "pending"],
    );
    return result.rows[0];
  }

  // Update a booking
  async update(id, bookingData) {
    const { status, total_price } = bookingData;
    const result = await query(
      "UPDATE bookings SET status = COALESCE($2, status), total_price = COALESCE($3, total_price) WHERE id = $1 RETURNING *",
      [id, status, total_price],
    );
    return result.rows[0] || null;
  }

  // Delete a booking
  async delete(id) {
    await query("DELETE FROM bookings WHERE id = $1", [id]);
    return true;
  }

  // Calculate total days between dates
  async calculateDays(start_date, end_date) {
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
}

module.exports = BookingRepository;
