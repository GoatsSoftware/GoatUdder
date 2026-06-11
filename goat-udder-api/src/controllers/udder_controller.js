const UdderService = require("../services/udder_service");

// Udder Controller - REST API handlers for pis de chèvre
class UdderController {
  constructor() {
    this.service = new UdderService();
  }

  // GET /api/udder - Get all pis
  async getAllUdders(req, res) {
    try {
      const udders = await this.service.getAllUdders();
      res.json({
        success: true,
        data: udders,
        count: udders.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/udder/available - Get available pis
  async getAvailableUdders(req, res) {
    try {
      const udders = await this.service.getAvailableUdders();
      res.json({
        success: true,
        data: udders,
        count: udders.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/udder/:id - Get pis by ID
  async getUdderById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const udder = await this.service.getUdderById(id);
      res.json({
        success: true,
        data: udder
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

  // POST /api/udder - Create a new pis
  async createUdder(req, res) {
    try {
      const udderData = req.body;
      const udder = await this.service.createUdder(udderData);
      res.status(201).json({
        success: true,
        data: udder
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/udder/:id - Update a pis
  async updateUdder(req, res) {
    try {
      const id = parseInt(req.params.id);
      const udderData = req.body;
      const udder = await this.service.updateUdder(id, udderData);
      res.json({
        success: true,
        data: udder
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

  // DELETE /api/udder/:id - Delete a pis
  async deleteUdder(req, res) {
    try {
      const id = parseInt(req.params.id);
      await this.service.deleteUdder(id);
      res.json({
        success: true,
        message: 'Pis supprimé avec succès'
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

module.exports = UdderController;