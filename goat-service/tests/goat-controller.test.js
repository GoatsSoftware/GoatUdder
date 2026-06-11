const request = require('supertest');
const GoatService = require('../src/service/goat-service');

jest.mock('../src/service/goat-service', () => {
  const mockService = {
    getAllGoats: jest.fn(),
    getGoatById: jest.fn(),
    getAvailableGoats: jest.fn(),
    isGoatAvailable: jest.fn(),
  };
  return jest.fn().mockReturnValue(mockService);
});

// Load app after mock is set up
const app = require('../src/index.js');

describe('GoatController', () => {
  let mockService;

  beforeEach(() => {
    mockService = GoatService.mock.results[0].value;
  });

  describe('GET /goats', () => {
    it('should return all goats', async () => {
      const mockGoats = [{ id: 1, name: 'Aglaé' }, { id: 2, name: 'Babette' }];
      mockService.getAllGoats.mockResolvedValue(mockGoats);

      const response = await request(app).get('/goats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGoats);
    });

    it('should return 500 on error', async () => {
      mockService.getAllGoats.mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app).get('/goats');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Erreur lors de la récupération des chèvres: Erreur DB');
    });
  });

  describe('GET /goats/:id', () => {
    it('should return a goat by id', async () => {
      const mockGoat = { id: 1, name: 'Aglaé', status: 'available' };
      mockService.getGoatById.mockResolvedValue(mockGoat);

      const response = await request(app).get('/goats/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGoat);
    });

    it('should return 404 when goat not found', async () => {
      mockService.getGoatById.mockResolvedValue(null);

      const response = await request(app).get('/goats/99');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Chèvre non trouvée');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).get('/goats/NaN');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ID invalide');
    });

    it('should return 400 for negative id', async () => {
      const response = await request(app).get('/goats/-1');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ID invalide');
    });

    it('should return 500 on error', async () => {
      mockService.getGoatById.mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app).get('/goats/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Erreur lors de la récupération de la chèvre: Erreur DB');
    });
  });

  describe('GET /goats/available', () => {
    it('should return available goats', async () => {
      const mockGoats = [{ id: 1, name: 'Aglaé', status: 'available' }];
      mockService.getAvailableGoats.mockResolvedValue(mockGoats);

      const response = await request(app).get('/goats/available');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGoats);
    });

    it('should return 500 on error', async () => {
      mockService.getAvailableGoats.mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app).get('/goats/available');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Erreur lors de la récupération des chèvres disponibles: Erreur DB');
    });
  });

  describe('GET /goats/:id/available', () => {
    it('should return availability status', async () => {
      mockService.isGoatAvailable.mockResolvedValue(true);

      const response = await request(app).get('/goats/1/available');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, available: true });
    });

    it('should return availability false', async () => {
      mockService.isGoatAvailable.mockResolvedValue(false);

      const response = await request(app).get('/goats/2/available');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 2, available: false });
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).get('/goats/NaN/available');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ID invalide');
    });

    it('should return 500 on error', async () => {
      mockService.isGoatAvailable.mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app).get('/goats/1/available');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Erreur lors de la vérification de disponibilité: Erreur DB');
    });
  });
});