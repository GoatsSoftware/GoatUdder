const GoatRepository = require('../data/goat-repository');

class GoatService {
  constructor() {
    this.repository = new GoatRepository();
  }

  async getAllGoats() {
    return await this.repository.findAll();
  }

  async getGoatById(id) {
    const goat = await this.repository.findById(id);
    if (!goat) {
      throw new Error('Chèvre non trouvée');
    }
    return goat;
  }

  async getAvailableGoats() {
    console.log("Service: Récupération des chèvres disponibles");
    return await this.repository.findAvailable();
  }

  async isGoatAvailable(id) {
    const goat = await this.repository.findById(id);
    if (!goat) {
      return false;
    }
    return goat.status === 'available' && goat.available_udders > 0;
  }

  async updateGoatStatus(id, status) {
    const goat = await this.repository.findById(id);
    if (!goat) {
      throw new Error('Chèvre non trouvée');
    }
    return await this.repository.updateStatus(id, status);
  }
}

module.exports = GoatService;