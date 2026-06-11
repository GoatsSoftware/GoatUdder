const pg = require('pg');

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '3444'),
  database: process.env.DB_NAME || 'goatudder',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

class RentalRepository {
  async findAll() {
    const result = await pool.query('SELECT * FROM rentals ORDER BY created_at DESC');
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM rentals WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findActive() {
    const result = await pool.query('SELECT * FROM rentals WHERE status = $1 ORDER BY created_at DESC', ['active']);
    return result.rows;
  }

  async create(goatIds, startDate, endDate, totalCost) {
    const result = await pool.query(
      'INSERT INTO rentals (goat_ids, start_date, end_date, total_cost, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [goatIds, startDate, endDate, totalCost, 'active']
    );
    return result.rows[0];
  }

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE rentals SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
}

module.exports = RentalRepository;