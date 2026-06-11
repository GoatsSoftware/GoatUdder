const pg = require('pg');

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number.parseInt(process.env.DB_PORT || '3444'),
  database: process.env.DB_NAME || 'goatudder',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

class GoatRepository {
  async findAll() {
    const result = await pool.query('SELECT * FROM goats ORDER BY id');
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM goats WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findAvailable() {
    console.log("Repository: Récupération des chèvres disponibles");
    const result = await pool.query('SELECT * FROM goats WHERE status = $1 ORDER BY id', ['available']);
    return result.rows;
  }

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE goats SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
}

module.exports = GoatRepository;