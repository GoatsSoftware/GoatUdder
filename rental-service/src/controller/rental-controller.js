const RentalService = require('../service/rental-service');

class RentalController {
  constructor() {
    this.service = new RentalService();
  }

  async getAllRentals(req, res) {
    try {
      const rentals = await this.service.getAllRentals();
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des locations:' + error.message });
    }
  }

  async getRentalById(req, res) {
    try {
      const id = Number.parseInt(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID invalide' });
      }
      const rental = await this.service.getRentalById(id);
      if (!rental) {
        return res.status(404).json({ error: 'Location non trouvée' });
      }
      res.json(rental);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération de la location:' + error.message });
    }
  }

  async getActiveRentals(req, res) {
    try {
      const rentals = await this.service.getActiveRentals();
      res.json(rentals);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des locations actives:' + error.message });
    }
  }

  async createRental(req, res) {
    try {
      const { goatIds, startDate, endDate } = req.body;
      const rental = await this.service.createRental(goatIds, startDate, endDate);
      res.status(201).json(rental);
    } catch (error) {
      res.status(400).json({ error: 'Erreur lors de la création de la location:' + error.message });
    }
  }

  async completeRental(req, res) {
    try {
      const id = Number.parseInt(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID invalide' });
      }
      const rental = await this.service.completeRental(id);
      res.json(rental);
    } catch (error) {
      res.status(400).json({ error: 'Erreur lors de la complétion de la location:' + error.message });
    }
  }
}

module.exports = RentalController;