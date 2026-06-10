const UserRepository = require('../data/repositories/user_repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User Service - Business logic for users
class UserService {
  constructor() {
    this.repository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'goatudder-secret-key';
  }

  // Get all users (excluding password hashes)
  async getAllUsers() {
    const users = await this.repository.findAll();
    return users.map(user => this.formatUser(user));
  }

  // Get user by ID
  async getUserById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid user ID');
    }
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return this.formatUser(user);
  }

  // Register a new user
  async register(userData) {
    this.validateRegistrationData(userData);
    
    // Check if username exists
    const existingUser = await this.repository.findByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Check if email exists
    const existingEmail = await this.repository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already exists');
    }

    const user = await this.repository.create(userData);
    return this.formatUser(user);
  }

  // Login user
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const user = await this.repository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isValidPassword = await this.repository.verifyPassword(user, password);
    if (!isValidPassword) {
      throw new Error('Invalid username or password');
    }

    const token = this.generateToken(user);
    return {
      user: this.formatUser(user),
      token
    };
  }

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Update user
  async updateUser(id, userData) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid user ID');
    }
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    this.validateUpdateData(userData);
    const updatedUser = await this.repository.update(id, userData);
    return this.formatUser(updatedUser);
  }

  // Delete user
  async deleteUser(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid user ID');
    }
    const existingUser = await this.repository.findById(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    await this.repository.delete(id);
    return true;
  }

  // Validate registration data
  validateRegistrationData(userData) {
    if (!userData.username || userData.username.trim() === '') {
      throw new Error('Username is required');
    }
    if (!userData.email || userData.email.trim() === '') {
      throw new Error('Email is required');
    }
    if (!userData.password || userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
  }

  // Validate update data
  validateUpdateData(userData) {
    if (userData.username && userData.username.trim() === '') {
      throw new Error('Username cannot be empty');
    }
    if (userData.email && userData.email.trim() === '') {
      throw new Error('Email cannot be empty');
    }
  }

  // Format user data for response (exclude password hash)
  formatUser(user) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };
  }
}

module.exports = UserService;