const GoatService = require("../service/goat-service");

class GoatController {
  constructor() {
    this.service = new GoatService();
  }

  async getAllGoats(req, res) {
    try {
      const goats = await this.service.getAllGoats();
      res.json(goats);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des chèvres: " + error.message });
    }
  }

  async getGoatById(req, res) {
    try {
      const id = Number.parseInt(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID invalide" });
      }
      const goat = await this.service.getGoatById(id);
      if (!goat) {
        return res.status(404).json({ error: "Chèvre non trouvée" });
      }
      res.json(goat);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération de la chèvre: " + error.message });
    }
  }

  async getAvailableGoats(req, res) {
    console.log("GoatController: getAvailableGoats called");
    try {
      console.log("Récupération des chèvres disponibles");
      const goats = await this.service.getAvailableGoats();
      res.json(goats);
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Erreur lors de la récupération des chèvres disponibles: " + error.message,
        });
    }
  }

  async isGoatAvailable(req, res) {
    try {
      const id = Number.parseInt(req.params.id);
      if (Number.isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID invalide" });
      }
      const available = await this.service.isGoatAvailable(id);
      res.json({ id, available });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Erreur lors de la vérification de disponibilité: " + error.message });
    }
  }
}

module.exports = GoatController;
