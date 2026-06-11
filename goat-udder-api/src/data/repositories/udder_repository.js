const { query } = require("../database");

// Udder Repository - Database operations for udder (pis de chèvre)
class UdderRepository {
  // Get all udder
  async findAll() {
    const result = await query("SELECT * FROM udder ORDER BY created_at DESC");
    return result.rows;
  }

  // Get udder by ID
  async findById(id) {
    const result = await query("SELECT * FROM udder WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  // Create a new udder
  async create(udderData) {
    const { name, location, capacity, price_per_day, amenities, status } =
      udderData;
    const result = await query(
      "INSERT INTO udder (name, location, capacity, price_per_day, amenities, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        name,
        location,
        capacity,
        price_per_day,
        amenities || [],
        status || "available",
      ],
    );
    return result.rows[0];
  }

  // Update a udder
  async update(id, udderData) {
    const { name, location, capacity, price_per_day, amenities, status } =
      udderData;
    const result = await query(
      "UPDATE udder SET name = COALESCE($2, name), location = COALESCE($3, location), capacity = COALESCE($4, capacity), price_per_day = COALESCE($5, price_per_day), amenities = COALESCE($6, amenities), status = COALESCE($7, status) WHERE id = $1 RETURNING *",
      [id, name, location, capacity, price_per_day, amenities, status],
    );
    return result.rows[0] || null;
  }

  // Delete a udder
  async delete(id) {
    await query("DELETE FROM udder WHERE id = $1", [id]);
    return true;
  }

  // Get available udder
  async findAvailable() {
    const result = await query(
      "SELECT * FROM udder WHERE status = $1 ORDER BY created_at DESC",
      ["available"],
    );
    return result.rows;
  }

  // Get udder by status
  async findByStatus(status) {
    const result = await query(
      "SELECT * FROM udder WHERE status = $1 ORDER BY created_at DESC",
      [status],
    );
    return result.rows;
  }
}

module.exports = UdderRepository;