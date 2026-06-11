const RentalService = require('../src/service/rental-service');

jest.mock('../src/data/rental-repository', () => {
  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findActive: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
  };
  return jest.fn().mockReturnValue(mockRepository);
});

describe('RentalService', () => {
  let rentalService;
  let mockRepository;

  beforeEach(() => {
    rentalService = new RentalService();
    mockRepository = require('../src/data/rental-repository').mock.results[0].value;
  });

  describe('getAllRentals', () => {
    it('should return all rentals', async () => {
      const mockRentals = [{ id: 1, goatIds: [1, 2] }];
      mockRepository.findAll.mockResolvedValue(mockRentals);

      const result = await rentalService.getAllRentals();

      expect(result).toEqual(mockRentals);
    });
  });

  describe('getRentalById', () => {
    it('should return a rental by id', async () => {
      const mockRental = { id: 1, goatIds: [1, 2], status: 'active' };
      mockRepository.findById.mockResolvedValue(mockRental);

      const result = await rentalService.getRentalById(1);

      expect(result).toEqual(mockRental);
    });

    it('should throw error when rental not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(rentalService.getRentalById(99)).rejects.toThrow('Location non trouvée');
    });
  });

  describe('getActiveRentals', () => {
    it('should return active rentals', async () => {
      const mockRentals = [{ id: 1, status: 'active' }];
      mockRepository.findActive.mockResolvedValue(mockRentals);

      const result = await rentalService.getActiveRentals();

      expect(result).toEqual(mockRentals);
    });
  });

  describe('calculateDays', () => {
    it('should calculate correct days', () => {
      const days = rentalService.calculateDays('2026-07-01', '2026-07-05');
      expect(days).toBe(4);
    });

    it('should throw error for duration less than 1 day', () => {
      expect(() => rentalService.calculateDays('2026-07-05', '2026-07-01')).toThrow(
        'Durée de location invalide: -4 jours (doit être entre 1 et 7)'
      );
    });

    it('should throw error for duration more than 7 days', () => {
      expect(() => rentalService.calculateDays('2026-07-01', '2026-07-10')).toThrow(
        'Durée de location invalide: 9 jours (doit être entre 1 et 7)'
      );
    });
  });

  describe('validateGoatIds', () => {
    it('should pass for valid goat ids', () => {
      expect(() => rentalService.validateGoatIds([1, 2])).not.toThrow();
    });

    it('should throw for empty goat ids', () => {
      expect(() => rentalService.validateGoatIds([])).toThrow(
        'Nombre de pis invalide: 0 (doit être entre 1 et 4)'
      );
    });

    it('should throw for more than 4 goat ids', () => {
      expect(() => rentalService.validateGoatIds([1, 2, 3, 4, 5])).toThrow(
        'Nombre de pis invalide: 5 (doit être entre 1 et 4)'
      );
    });

    it('should throw for null goat ids', () => {
      expect(() => rentalService.validateGoatIds(null)).toThrow(
        'Nombre de pis invalide: 0 (doit être entre 1 et 4)'
      );
    });
  });

  describe('calculateCost', () => {
    it('should calculate correct cost', async () => {
      const cost = await rentalService.calculateCost([1, 2], '2026-07-01', '2026-07-05');
      expect(cost).toBe(80);
    });
  });

  describe('createRental', () => {
    it('should create a rental', async () => {
      const mockRental = { id: 1, goatIds: [1, 2], start_date: '2026-07-01', end_date: '2026-07-05', total_cost: 80, status: 'active' };
      mockRepository.create.mockResolvedValue(mockRental);

      const result = await rentalService.createRental([1, 2], '2026-07-01', '2026-07-05');

      expect(result).toEqual(mockRental);
      expect(mockRepository.create).toHaveBeenCalledWith([1, 2], '2026-07-01', '2026-07-05', 80);
    });

    it('should throw for invalid duration', async () => {
      await expect(rentalService.createRental([1], '2026-07-10', '2026-07-01')).rejects.toThrow(
        'Durée de location invalide'
      );
    });

    it('should throw for invalid goat count', async () => {
      await expect(rentalService.createRental([1, 2, 3, 4, 5], '2026-07-01', '2026-07-03')).rejects.toThrow(
        'Nombre de pis invalide'
      );
    });
  });

  describe('completeRental', () => {
    it('should complete a rental', async () => {
      const mockRental = { id: 1, status: 'active' };
      mockRepository.findById.mockResolvedValue(mockRental);
      mockRepository.updateStatus.mockResolvedValue({ ...mockRental, status: 'completed' });

      const result = await rentalService.completeRental(1);

      expect(result.status).toBe('completed');
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(1, 'completed');
    });

    it('should throw when rental not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(rentalService.completeRental(99)).rejects.toThrow('Location non trouvée');
    });
  });
});