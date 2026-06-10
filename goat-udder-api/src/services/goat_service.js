const GoatRepository = require('../data/repositories/goat_repository');
const PadRepository = require('../data/repositories/pad_repository');

// Goat Service - Business logic for goats
class GoatService {
  constructor() {
    this.repository = new GoatRepository();
    this.padRepository = new PadRepository();
  }

  // Get all goats
  async getAllGoats() {
    const goats = await this.repository.findAll();
    return goats.map(goat => this.formatGoat(goat));
  }

  // Get goat by ID
  async getGoatById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid goat ID');
    }
    const goat = await this.repository.findById(id);
    if (!goat) {
      throw new Error(`Goat with ID ${id} not found`);
    }
    return this.formatGoat(goat);
  }

  // Get goats by pad ID
  async getGoatsByPadId(padId) {
    if (!padId || isNaN(padId)) {
      throw new Error('Invalid pad ID');
    }
    const pad = await this.padRepository.findById(padId);
    if (!pad) {
      throw new Error(`Pad with ID ${padId} not found`);
    }
    const goats = await this.repository.findByPadId(padId);
    return goats.map(goat => this.formatGoat(goat));
  }

  // Get healthy goats
  async getHealthyGoats() {
    const goats = await this.repository.findHealthy();
    return goats.map(goat => this.formatGoat(goat));
  }

  // Create a new goat
  async createGoat(goatData) {
    this.validateGoatData(goatData);

    // Check pad existence
    const pad = await this.padRepository.findById(goatData.pad_id);
    if (!pad) {
      throw new Error(`Pad with ID ${goatData.pad_id} not found`);
    }

    const goat = await this.repository.create(goatData);
    return this.formatGoat(goat);
  }

  // Update a goat
  async updateGoat(id, goatData) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid goat ID');
    }
    const existingGoat = await this.repository.findById(id);
    if (!existingGoat) {
      throw new Error(`Goat with ID ${id} not found`);
    }
    this.validateGoatData(goatData, true);
    const updatedGoat = await this.repository.update(id, goatData);
    return this.formatGoat(updatedGoat);
  }

  // Delete a goat
  async deleteGoat(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid goat ID');
    }
    const existingGoat = await this.repository.findById(id);
    if (!existingGoat) {
      throw new Error(`Goat with ID ${id} not found`);
    }
    await this.repository.delete(id);
    return true;
  }

  // Get average milk production for a pad
  async getAverageMilkProduction(padId) {
    if (!padId || isNaN(padId)) {
      throw new Error('Invalid pad ID');
    }
    const avg = await this.repository.getAverageMilkProduction(padId);
    return parseFloat(avg);
  }

  // Validate goat data
  validateGoatData(goatData, partial = false) {
    if (!partial) {
      if (!goatData.pad_id || isNaN(goatData.pad_id)) {
        throw new Error('Valid pad_id is required');
      }
      if (!goatData.name || goatData.name.trim() === '') {
        throw new Error('Goat name is required');
      }
      if (!goatData.breed || goatData.breed.trim() === '') {
        throw new Error('Goat breed is required');
      }
    } else {
      if (goatData.name && goatData.name.trim() === '') {
        throw new Error('Goat name cannot be empty');
      }
      if (goatData.breed && goatData.breed.trim() === '') {
        throw new Error('Goat breed cannot be empty');
      }
    }
  }

  // Format goat data for response
  formatGoat(goat) {
    return {
      id: goat.id,
      pad_id: goat.pad_id,
      pad_name: goat.pad_name,
      pad_location: goat.pad_location,
      name: goat.name,
      breed: goat.breed,
      age: goat.age,
      milk_production: parseFloat(goat.milk_production),
      health_status: goat.health_status,
      created_at: goat.created_at
    };
  }
}

module.exports = GoatService;