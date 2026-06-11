const PadRepository = require("../data/repositories/pad_repository");

// Pad Service - Business logic for udder
class PadService {
  constructor() {
    this.repository = new PadRepository();
  }

  // Get all udder
  async getAllPads() {
    const udder = await this.repository.findAll();
    return udder.map((pad) => this.formatPad(pad));
  }

  // Get pad by ID
  async getPadById(id) {
    if (!id || isNaN(id)) {
      throw new Error("Invalid pad ID");
    }
    const pad = await this.repository.findById(id);
    if (!pad) {
      throw new Error(`Pad with ID ${id} not found`);
    }
    return this.formatPad(pad);
  }

  // Get available udder
  async getAvailablePads() {
    const udder = await this.repository.findAvailable();
    return udder.map((pad) => this.formatPad(pad));
  }

  // Create a new pad
  async createPad(padData) {
    this.validatePadData(padData);
    const pad = await this.repository.create(padData);
    return this.formatPad(pad);
  }

  // Update a pad
  async updatePad(id, padData) {
    if (!id || isNaN(id)) {
      throw new Error("Invalid pad ID");
    }
    const existingPad = await this.repository.findById(id);
    if (!existingPad) {
      throw new Error(`Pad with ID ${id} not found`);
    }
    this.validatePadData(padData, true);
    const updatedPad = await this.repository.update(id, padData);
    return this.formatPad(updatedPad);
  }

  // Delete a pad
  async deletePad(id) {
    if (!id || isNaN(id)) {
      throw new Error("Invalid pad ID");
    }
    const existingPad = await this.repository.findById(id);
    if (!existingPad) {
      throw new Error(`Pad with ID ${id} not found`);
    }
    await this.repository.delete(id);
    return true;
  }

  // Validate pad data
  validatePadData(padData, partial = false) {
    if (!partial) {
      if (!padData.name || padData.name.trim() === "") {
        throw new Error("Pad name is required");
      }
      if (!padData.location || padData.location.trim() === "") {
        throw new Error("Pad location is required");
      }
      if (!padData.capacity || padData.capacity <= 0) {
        throw new Error("Pad capacity must be a positive number");
      }
      if (!padData.price_per_day || padData.price_per_day <= 0) {
        throw new Error("Pad price_per_day must be a positive number");
      }
    } else {
      if (padData.name && padData.name.trim() === "") {
        throw new Error("Pad name cannot be empty");
      }
      if (padData.location && padData.location.trim() === "") {
        throw new Error("Pad location cannot be empty");
      }
      if (padData.capacity && padData.capacity <= 0) {
        throw new Error("Pad capacity must be a positive number");
      }
      if (padData.price_per_day && padData.price_per_day <= 0) {
        throw new Error("Pad price_per_day must be a positive number");
      }
    }
  }

  // Format pad data for response
  formatPad(pad) {
    return {
      id: pad.id,
      name: pad.name,
      location: pad.location,
      capacity: pad.capacity,
      price_per_day: parseFloat(pad.price_per_day),
      amenities: pad.amenities || [],
      status: pad.status,
      created_at: pad.created_at,
    };
  }
}

module.exports = PadService;
