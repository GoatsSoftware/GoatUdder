const { query } = require('../database');
const bcrypt = require('bcrypt');

// User Repository - Database operations for users
class UserRepository {
  // Get all users
  async findAll() {
    const result = await query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  // Get user by ID
  async findById(id) {
    const result = await query('SELECT id, username, email, role, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Get user by username
  async findByUsername(username) {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  // Get user by email
  async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  // Create a new user
  async create(userData) {
    const { username, email, password, role } = userData;
    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, password_hash, role || 'customer']
    );
    return result.rows[0];
  }

  // Verify password
  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }

  // Update user
  async update(id, userData) {
    const { username, email, role } = userData;
    const result = await query(
      'UPDATE users SET username = COALESCE($2, username), email = COALESCE($3, email), role = COALESCE($4, role) WHERE id = $1 RETURNING id, username, email, role, created_at',
      [id, username, email, role]
    );
    return result.rows[0] || null;
  }

  // Delete user
  async delete(id) {
    await query('DELETE FROM users WHERE id = $1', [id]);
    return true;
  }
}

module.exports = UserRepository;