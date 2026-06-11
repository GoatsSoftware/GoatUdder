const GoatService = require('../src/service/goat-service');
const GoatRepository = require('../src/data/goat-repository');

jest.mock('../src/data/goat-repository');

describe('GoatService', () => {
  let goatService;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findAvailable: jest.fn(),
      updateStatus: jest.fn(),
    };
    GoatRepository.mockImplementation(() => mockRepository);
    goatService = new GoatService();
  });

  describe('getAllGoats', () => {
    it('should return all goats', async () => {
      const mockGoats = [{ id: 1, name: 'Aglaé' }, { id: 2, name: 'Babette' }];
      mockRepository.findAll.mockResolvedValue(mockGoats);

      const result = await goatService.getAllGoats();

      expect(result).toEqual(mockGoats);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getGoatById', () => {
    it('should return a goat by id', async () => {
      const mockGoat = { id: 1, name: 'Aglaé', status: 'available' };
      mockRepository.findById.mockResolvedValue(mockGoat);

      const result = await goatService.getGoatById(1);

      expect(result).toEqual(mockGoat);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error when goat not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(goatService.getGoatById(99)).rejects.toThrow('Chèvre non trouvée');
    });
  });

  describe('getAvailableGoats', () => {
    it('should return available goats', async () => {
      const mockGoats = [{ id: 1, name: 'Aglaé', status: 'available' }];
      mockRepository.findAvailable.mockResolvedValue(mockGoats);

      const result = await goatService.getAvailableGoats();

      expect(result).toEqual(mockGoats);
      expect(mockRepository.findAvailable).toHaveBeenCalled();
    });
  });

  describe('isGoatAvailable', () => {
    it('should return true when goat is available', async () => {
      const mockGoat = { id: 1, status: 'available', available_udders: 4 };
      mockRepository.findById.mockResolvedValue(mockGoat);

      const result = await goatService.isGoatAvailable(1);

      expect(result).toBe(true);
    });

    it('should return false when goat is not available', async () => {
      const mockGoat = { id: 1, status: 'rented', available_udders: 0 };
      mockRepository.findById.mockResolvedValue(mockGoat);

      const result = await goatService.isGoatAvailable(1);

      expect(result).toBe(false);
    });

    it('should return false when goat not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await goatService.isGoatAvailable(99);

      expect(result).toBe(false);
    });
  });

  describe('updateGoatStatus', () => {
    it('should update goat status', async () => {
      const mockGoat = { id: 1, name: 'Aglaé', status: 'available' };
      mockRepository.findById.mockResolvedValue(mockGoat);
      mockRepository.updateStatus.mockResolvedValue({ ...mockGoat, status: 'rented' });

      const result = await goatService.updateGoatStatus(1, 'rented');

      expect(result.status).toBe('rented');
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(1, 'rented');
    });

    it('should throw error when goat not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(goatService.updateGoatStatus(99, 'rented')).rejects.toThrow('Chèvre non trouvée');
    });
  });
});