const request = require('supertest');
const app = require('../src/index.js');
const RentalService = require('../src/service/rental-service');

jest.mock('../src/service/rental-service');

describe('RentalController', () => {
  let mockService;

  beforeEach(() => {
    mockService = {
      getAllRentals: jest.fn(),
      getRentalById: jest.fn(),
      getActiveRentals: jest.fn(),
      createRental: jest.fn(),
      completeRental: jest.fn(),
    };
    RentalService.mockImplementation(() => mockService);
  });

  describe('GET /rentals', () => {
    it('should return all rentals', async () => {
      const mockRentals = [{ id: 1, goatIds: [1, 2], status: 'active' }];
      mockService.getAllRentals.mockResolvedValue(mockRentals);

      const response = await request(app).get('/rentals');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRentals);
    });

    it('should return 500 on error', async () => {
      mockService.getAllRentals.mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app).get('/rentals');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Erreur lors de la récupération des locations');
    });
  });

  describe('GET /rentals/:id', () => {
    it('should return a rental by id', async () => {
      const mockRental = { id: 1, goatIds: [1, 2], status: 'active' };
      mockService.getRentalById.mockResolvedValue(mockRental);

      const response = await request(app).get('/rentals/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRental);
    });

    it('should return 404 when rental not found', async () => {
      mockService.getRentalById.mockResolvedValue(null);

      const response = await request(app).get('/rentals/99');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Location non trouvée');
    });
  });

  describe('GET /rentals/active', () => {
    it('should return active rentals', async () => {
      const mockRentals = [{ id: 1, status: 'active' }];
      mockService.getActiveRentals.mockResolvedValue(mockRentals);

      const response = await request(app).get('/rentals/active');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRentals);
    });
  });

  describe('POST /rentals', () => {
    it('should create a rental', async () => {
      const mockRental = { id: 1, goatIds: [1, 2], start_date: '2026-07-01', end_date: '2026-07-05', total_cost: 40, status: 'active' };
      mockService.createRental.mockResolvedValue(mockRental);

      const response = await request(app)
        .post('/rentals')
        .send({ goatIds: [1, 2], startDate: '2026-07-01', endDate: '2026-07-05' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockRental);
    });

    it('should return 400 on validation error', async () => {
      mockService.createRental.mockRejectedValue(new Error('Durée de location invalide'));

      const response = await request(app)
        .post('/rentals')
        .send({ goatIds: [1], startDate: '2026-07-10', endDate: '2026-07-01' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Durée de location invalide');
    });
  });

  describe('POST /rentals/:id/complete', () => {
    it('should complete a rental', async () => {
      const mockRental = { id: 1, status: 'completed' };
      mockService.completeRental.mockResolvedValue(mockRental);

      const response = await request(app).post('/rentals/1/complete');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
    });

    it('should return 400 on error', async () => {
      mockService.completeRental.mockRejectedValue(new Error('Location non trouvée'));

      const response = await request(app).post('/rentals/99/complete');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Location non trouvée');
    });
  });
});