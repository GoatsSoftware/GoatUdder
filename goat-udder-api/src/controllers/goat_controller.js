const GoatService = require('../services/goat_service');

// Goat Controller - REST API handlers for goats
class GoatController {
  constructor() {
    this.service = new GoatService();
  }

  // GET /api/goats - Get all goats
  async getAllGoats(req, res) {
    try {
      const goats = await this.service.getAllGoats();
      res.json({
        success: true,
        data: goats,
        count: goats.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/goats/:id - Get goat by ID
  async getGoatById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const goat = await this.service.getGoatById(id);
      res.json({
        success: true,
        data: goat
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

  // GET /api/goats/pad/:padId - Get goats by pad ID
  async getGoatsByPadId(req, res) {
    try {
      const padId = parseInt(req.params.padId);
      const goats = await this.service.getGoatsByPadId(padId);
      res.json({
        success: true,
        data: goats,
        count: goats.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/goats/healthy - Get healthy goats
  async getHealthyGoats(req, res) {
    try {
      const goats = await this.service.getHealthyGoats();
      res.json({
        success: true,
        data: goats,
        count: goats.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/goats/pad/:padId/milk-production - Get average milk production for a pad
  async getAverageMilkProduction(req, res) {
    try {
      const padId = parseInt(req.params.padId);
      const avg = await this.service.getAverageMilkProduction(padId);
      res.json({
        success: true,
        data: {
          pad_id: padId,
          average_milk_production: avg
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/goats - Create a new goat
  async createGoat(req, res) {
    try {
      const goatData = req.body;
      const goat = await this.service.createGoat(goatData);
      res.status(201).json({
        success: true,
        data: goat
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/goats/:id - Update a goat
  async updateGoat(req, res) {
    try {
      const id = parseInt(req.params.id);
      const goatData = req.body;
      const goat = await this.service.updateGoat(id, goatData);
      res.json({
        success: true,
        data: goat
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

  // DELETE /api/goats/:id - Delete a goat
  async deleteGoat(req, res) {
    try {
      const id = parseInt(req.params.id);
      await this.service.deleteGoat(id);
      res.json({
        success: true,
        message: 'Goat deleted successfully'
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

module.exports = GoatController;