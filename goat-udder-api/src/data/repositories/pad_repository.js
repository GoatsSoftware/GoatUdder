const { query } = require('../database');

// Pad Repository - Database operations for pads
class PadRepository {
  // Get all pads
  async findAll() {
    const result = await query('SELECT * FROM pads ORDER BY created_at DESC');
    return result.rows;
  }

  // Get pad by ID
  async findById(id) {
    const result = await query('SELECT * FROM pads WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Create a new pad
  async create(padData) {
    const { name, location, capacity, price_per_day, amenities, status } = padData;
    const result = await query(
      'INSERT INTO pads (name, location, capacity, price_per_day, amenities, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, location, capacity, price_per_day, amenities || [], status || 'available']
    );
    return result.rows[0];
  }

  // Update a pad
  async update(id, padData) {
    const { name, location, capacity, price_per_day, amenities, status } = padData;
    const result = await query(
      'UPDATE pads SET name = COALESCE($2, name), location = COALESCE($3, location), capacity = COALESCE($4, capacity), price_per_day = COALESCE($5, price_per_day), amenities = COALESCE($6, amenities), status = COALESCE($7, status) WHERE id = $1 RETURNING *',
      [id, name, location, capacity, price_per_day, amenities, status]
    );
    return result.rows[0] || null;
  }

  // Delete a pad
  async delete(id) {
    await query('DELETE FROM pads WHERE id = $1', [id]);
    return true;
  }

  // Get available pads
  async findAvailable() {
    const result = await query('SELECT * FROM pads WHERE status = $1 ORDER BY created_at DESC', ['available']);
    return result.rows;
  }

  // Get pads by status
  async findByStatus(status) {
    const result = await query('SELECT * FROM pads WHERE status = $1 ORDER BY created_at DESC', [status]);
    return result.rows;
  }
}

module.exports = PadRepository;