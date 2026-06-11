const RentalRepository = require('../data/rental-repository');

const TARIF_PAR_JOUR_PAR_PIS = 10;
const DUREE_MIN = 1;
const DUREE_MAX = 7;
const PIS_MIN = 1;
const PIS_MAX = 4;

class RentalService {
  constructor() {
    this.repository = new RentalRepository();
  }

  async getAllRentals() {
    return await this.repository.findAll();
  }

  async getRentalById(id) {
    const rental = await this.repository.findById(id);
    if (!rental) {
      throw new Error('Location non trouvée');
    }
    return rental;
  }

  async getActiveRentals() {
    return await this.repository.findActive();
  }

  async calculateCost(goatIds, startDate, endDate) {
    const days = this.calculateDays(startDate, endDate);
    const udderCount = goatIds.length;
    return days * udderCount * TARIF_PAR_JOUR_PAR_PIS;
  }

  calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < DUREE_MIN || diffDays > DUREE_MAX) {
      throw new Error(`Durée de location invalide: ${diffDays} jours (doit être entre ${DUREE_MIN} et ${DUREE_MAX})`);
    }
    return diffDays;
  }

  validateGoatIds(goatIds) {
    if (!goatIds || goatIds.length < PIS_MIN || goatIds.length > PIS_MAX) {
      throw new Error(`Nombre de pis invalide: ${goatIds ? goatIds.length : 0} (doit être entre ${PIS_MIN} et ${PIS_MAX})`);
    }
  }

  async createRental(goatIds, startDate, endDate) {
    this.validateGoatIds(goatIds);
    const days = this.calculateDays(startDate, endDate);
    const totalCost = days * goatIds.length * TARIF_PAR_JOUR_PAR_PIS;

    return await this.repository.create(goatIds, startDate, endDate, totalCost);
  }

  async completeRental(id) {
    const rental = await this.repository.findById(id);
    if (!rental) {
      throw new Error('Location non trouvée');
    }
    return await this.repository.updateStatus(id, 'completed');
  }
}

module.exports = RentalService;