const { query } = require("../database");

// Goat Repository - Database operations for goats
class GoatRepository {
  // Get all goats
  async findAll() {
    const result = await query(`
      SELECT g.*, p.name as udder_name, p.location as udder_location
       FROM goats g
       JOIN udder p ON g.udder_id = p.id
      ORDER BY g.created_at DESC
    `);
    return result.rows;
  }

  // Get goat by ID
  async findById(id) {
    const result = await query(
      `
      SELECT g.*, p.name as udder_name, p.location as udder_location
       FROM goats g
       JOIN udder p ON g.udder_id = p.id
       WHERE g.id = $1
    `,
      [id],
    );
    return result.rows[0] || null;
  }

  // Get goats by udder ID
  async findByUdderId(udderId) {
    const result = await query(
      `
      SELECT g.*, p.name as udder_name
      FROM goats g
      JOIN udder p ON g.udder_id = p.id
      WHERE g.udder_id = $1
      ORDER BY g.created_at DESC
    `,
      [udderId],
    );
    return result.rows;
  }

  // Get healthy goats
  async findHealthy() {
    const result = await query(
      "SELECT * FROM goats WHERE health_status = $1 ORDER BY created_at DESC",
      ["healthy"],
    );
    return result.rows;
  }

  // Create a new goat
  async create(goatData) {
    const { udder_id, name, breed, age, milk_production, health_status } =
      goatData;
    const result = await query(
      "INSERT INTO goats (udder_id, name, breed, age, milk_production, health_status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [udder_id, name, breed, age, milk_production, health_status || "healthy"],
    );
    return result.rows[0];
  }

  // Update a goat
  async update(id, goatData) {
    const { name, breed, age, milk_production, health_status } = goatData;
    const result = await query(
      "UPDATE goats SET name = COALESCE($2, name), breed = COALESCE($3, breed), age = COALESCE($4, age), milk_production = COALESCE($5, milk_production), health_status = COALESCE($6, health_status) WHERE id = $1 RETURNING *",
      [id, name, breed, age, milk_production, health_status],
    );
    return result.rows[0] || null;
  }

  // Delete a goat
  async delete(id) {
    await query("DELETE FROM goats WHERE id = $1", [id]);
    return true;
  }

  // Get average milk production by udder
  async getAverageMilkProduction(udderId) {
    const result = await query(
      "SELECT AVG(milk_production) as avg_milk FROM goats WHERE udder_id = $1",
      [udderId],
    );
    return result.rows[0].avg_milk || 0;
  }
}

module.exports = GoatRepository;
