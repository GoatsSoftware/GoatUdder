const UdderRepository = require("../data/repositories/udder_repository");

// Udder Service - Business logic for pis de chèvre
class UdderService {
  constructor() {
    this.repository = new UdderRepository();
  }

  // Get all pis
  async getAllUdders() {
    const udder = await this.repository.findAll();
    return udder.map((pis) => this.formatUdder(pis));
  }

  // Get pis by ID
  async getUdderById(id) {
    if (!id || isNaN(id)) {
      throw new Error("Invalid pis ID");
    }
    const pis = await this.repository.findById(id);
    if (!pis) {
      throw new Error(`Pis with ID ${id} not found`);
    }
    return this.formatUdder(pis);
  }

  // Get available pis
  async getAvailableUdders() {
    const udder = await this.repository.findAvailable();
    return udder.map((pis) => this.formatUdder(pis));
  }

  // Create a new pis
  async createUdder(udderData) {
    this.validateUdderData(udderData);
    const pis = await this.repository.create(udderData);
    return this.formatUdder(pis);
  }

  // Update a pis
  async updateUdder(id, udderData) {
    if (!id || isNaN(id)) {
      throw new Error("Invalid pis ID");
    }
    const existingPis = await this.repository.findById(id);
    if (!existingPis) {
      throw new Error(`Pis with ID ${id} not found`);
    }
    this.validateUdderData(udderData, true);
    const updatedPis = await this.repository.update(id, udderData);
    return this.formatUdder(updatedPis);
  }

  // Delete a pis
  async deleteUdder(id) {
    if (!id || isNaN(id)) {
      throw new Error("Invalid pis ID");
    }
    const existingPis = await this.repository.findById(id);
    if (!existingPis) {
      throw new Error(`Pis with ID ${id} not found`);
    }
    await this.repository.delete(id);
    return true;
  }

  // Validate pis data
  validateUdderData(udderData, partial = false) {
    if (!partial) {
      if (!udderData.name || udderData.name.trim() === "") {
        throw new Error("Le nom du pis est requis");
      }
      if (!udderData.location || udderData.location.trim() === "") {
        throw new Error("La location du pis est requise");
      }
      if (!udderData.capacity || udderData.capacity <= 0) {
        throw new Error("La capacité doit être un nombre positif");
      }
      if (!udderData.price_per_day || udderData.price_per_day <= 0) {
        throw new Error("Le prix doit être un nombre positif");
      }
    } else {
      if (udderData.name && udderData.name.trim() === "") {
        throw new Error("Le nom du pis ne peut pas être vide");
      }
      if (udderData.location && udderData.location.trim() === "") {
        throw new Error("La location du pis ne peut pas être vide");
      }
      if (udderData.capacity && udderData.capacity <= 0) {
        throw new Error("La capacité doit être un nombre positif");
      }
      if (udderData.price_per_day && udderData.price_per_day <= 0) {
        throw new Error("Le prix doit être un nombre positif");
      }
    }
  }

  // Format pis data for response
  formatUdder(pis) {
    return {
      id: pis.id,
      name: pis.name,
      location: pis.location,
      capacity: pis.capacity,
      price_per_day: parseFloat(pis.price_per_day),
      amenities: pis.amenities || [],
      status: pis.status,
      created_at: pis.created_at,
    };
  }
}

module.exports = UdderService;