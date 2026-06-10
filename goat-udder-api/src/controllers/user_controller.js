const UserService = require('../services/user_service');

// User Controller - REST API handlers for users
class UserController {
  constructor() {
    this.service = new UserService();
  }

  // GET /api/users - Get all users
  async getAllUsers(req, res) {
    try {
      const users = await this.service.getAllUsers();
      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/users/:id - Get user by ID
  async getUserById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const user = await this.service.getUserById(id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  }

  // POST /api/users/register - Register a new user
  async register(req, res) {
    try {
      const userData = req.body;
      const user = await this.service.register(userData);
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/users/login - Login user
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await this.service.login(username, password);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/users/:id - Update user
  async updateUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      const user = await this.service.updateUser(id, userData);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  }

  // DELETE /api/users/:id - Delete user
  async deleteUser(req, res) {
    try {
      const id = parseInt(req.params.id);
      await this.service.deleteUser(id);
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  }
}

module.exports = UserController;