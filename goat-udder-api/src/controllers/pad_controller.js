const PadService = require('../services/pad_service');

// Pad Controller - REST API handlers for pads
class PadController {
  constructor() {
    this.service = new PadService();
  }

  // GET /api/pads - Get all pads
  async getAllPads(req, res) {
    try {
      const pads = await this.service.getAllPads();
      res.json({
        success: true,
        data: pads,
        count: pads.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/pads/available - Get available pads
  async getAvailablePads(req, res) {
    try {
      const pads = await this.service.getAvailablePads();
      res.json({
        success: true,
        data: pads,
        count: pads.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/pads/:id - Get pad by ID
  async getPadById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const pad = await this.service.getPadById(id);
      res.json({
        success: true,
        data: pad
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

  // POST /api/pads - Create a new pad
  async createPad(req, res) {
    try {
      const padData = req.body;
      const pad = await this.service.createPad(padData);
      res.status(201).json({
        success: true,
        data: pad
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/pads/:id - Update a pad
  async updatePad(req, res) {
    try {
      const id = parseInt(req.params.id);
      const padData = req.body;
      const pad = await this.service.updatePad(id, padData);
      res.json({
        success: true,
        data: pad
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

  // DELETE /api/pads/:id - Delete a pad
  async deletePad(req, res) {
    try {
      const id = parseInt(req.params.id);
      await this.service.deletePad(id);
      res.json({
        success: true,
        message: 'Pad deleted successfully'
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

module.exports = PadController;