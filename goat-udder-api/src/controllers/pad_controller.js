const PadService = require("../services/pad_service");

// Pad Controller - REST API handlers for udder
class PadController {
  constructor() {
    this.service = new PadService();
  }

  // GET /api/udder - Get all udder
  async getAllPads(req, res) {
    try {
      const udder = await this.service.getAllPads();
      res.json({
        success: true,
        data: udder,
        count: udder.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // GET /api/udder/available - Get available udder
  async getAvailablePads(req, res) {
    try {
      const udder = await this.service.getAvailablePads();
      res.json({
        success: true,
        data: udder,
        count: udder.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // GET /api/udder/:id - Get pad by ID
  async getPadById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const pad = await this.service.getPadById(id);
      res.json({
        success: true,
        data: pad,
      });
    } catch (error) {
      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      }
    }
  }

  // POST /api/udder - Create a new pad
  async createPad(req, res) {
    try {
      const padData = req.body;
      const pad = await this.service.createPad(padData);
      res.status(201).json({
        success: true,
        data: pad,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // PUT /api/udder/:id - Update a pad
  async updatePad(req, res) {
    try {
      const id = parseInt(req.params.id);
      const padData = req.body;
      const pad = await this.service.updatePad(id, padData);
      res.json({
        success: true,
        data: pad,
      });
    } catch (error) {
      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      }
    }
  }

  // DELETE /api/udder/:id - Delete a pad
  async deletePad(req, res) {
    try {
      const id = parseInt(req.params.id);
      await this.service.deletePad(id);
      res.json({
        success: true,
        message: "Pad deleted successfully",
      });
    } catch (error) {
      if (error.message.includes("not found")) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      }
    }
  }
}

module.exports = PadController;
