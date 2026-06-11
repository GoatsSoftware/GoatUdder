const GoatRepository = require('../data/repositories/goat_repository');
const UdderRepository = require('../data/repositories/udder_repository');

// Goat Service - Business logic for goats
class GoatService {
  constructor() {
    this.repository = new GoatRepository();
    this.udderRepository = new UdderRepository();
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

  // Get goats by udder ID
  async getGoatsByUdderId(udderId) {
    if (!udderId || isNaN(udderId)) {
      throw new Error('Invalid udder ID');
    }
    const udder = await this.udderRepository.findById(udderId);
    if (!udder) {
      throw new Error(`Pis with ID ${udderId} not found`);
    }
    const goats = await this.repository.findByUdderId(udderId);
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

    // Check udder existence
    const udder = await this.udderRepository.findById(goatData.udder_id);
    if (!udder) {
      throw new Error(`Pis with ID ${goatData.udder_id} not found`);
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

  // Get average milk production for a udder
  async getAverageMilkProduction(udderId) {
    if (!udderId || isNaN(udderId)) {
      throw new Error('Invalid udder ID');
    }
    const avg = await this.repository.getAverageMilkProduction(udderId);
    return parseFloat(avg);
  }

  // Validate goat data
  validateGoatData(goatData, partial = false) {
    if (!partial) {
      if (!goatData.udder_id || isNaN(goatData.udder_id)) {
        throw new Error('Valid udder_id est requis');
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
      udder_id: goat.udder_id,
      udder_name: goat.udder_name,
      udder_location: goat.udder_location,
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