const GoatService = require('../src/services/goat_service');
const GoatRepository = require('../src/data/repositories/goat_repository');
const PadRepository = require('../src/data/repositories/pad_repository');

// Mock repositories
const mockGoatRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByPadId: jest.fn(),
  findHealthy: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getAverageMilkProduction: jest.fn(),
};

const mockPadRepository = {
  findById: jest.fn(),
};

jest.mock('../src/data/repositories/goat_repository');
GoatRepository.mockImplementation(() => mockGoatRepository);

jest.mock('../src/data/repositories/pad_repository');
PadRepository.mockImplementation(() => mockPadRepository);

describe('GoatService', () => {
  let service;

  beforeEach(() => {
    service = new GoatService();
    jest.clearAllMocks();
  });

  describe('getAllGoats', () => {
    it('should return all goats formatted', async () => {
      const mockGoats = [
        { id: 1, pad_id: 1, name: 'Fleur', breed: 'Alpine', age: 4, milk_production: '3.5', health_status: 'healthy', pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', created_at: new Date() },
      ];
      mockGoatRepository.findAll.mockResolvedValue(mockGoats);

      const result = await service.getAllGoats();

      expect(mockGoatRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].milk_production).toBe(3.5);
    });
  });

  describe('getGoatById', () => {
    it('should return goat by ID', async () => {
      const mockGoat = { id: 1, pad_id: 1, name: 'Fleur', breed: 'Alpine', age: 4, milk_production: '3.5', health_status: 'healthy', pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', created_at: new Date() };
      mockGoatRepository.findById.mockResolvedValue(mockGoat);

      const result = await service.getGoatById(1);

      expect(mockGoatRepository.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });

    it('should throw error when goat not found', async () => {
      mockGoatRepository.findById.mockResolvedValue(null);

      await expect(service.getGoatById(99)).rejects.toThrow('Goat with ID 99 not found');
    });

    it('should throw error for invalid ID', async () => {
      await expect(service.getGoatById(null)).rejects.toThrow('Invalid goat ID');
    });
  });

  describe('getGoatsByPadId', () => {
    it('should return goats by pad ID', async () => {
      const mockGoats = [
        { id: 1, pad_id: 1, name: 'Fleur', breed: 'Alpine', age: 4, milk_production: '3.5', health_status: 'healthy', pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', created_at: new Date() },
      ];
      const mockPad = { id: 1, name: 'Pasteur Alpine', location: 'Pyrénées', capacity: 20, price_per_day: '25.00', status: 'available', amenities: [] };
      mockPadRepository.findById.mockResolvedValue(mockPad);
      mockGoatRepository.findByPadId.mockResolvedValue(mockGoats);

      const result = await service.getGoatsByPadId(1);

      expect(mockPadRepository.findById).toHaveBeenCalledWith(1);
      expect(mockGoatRepository.findByPadId).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });

    it('should throw error when pad not found', async () => {
      mockPadRepository.findById.mockResolvedValue(null);

      await expect(service.getGoatsByPadId(99)).rejects.toThrow('Pad with ID 99 not found');
    });

    it('should throw error for invalid pad ID', async () => {
      await expect(service.getGoatsByPadId(null)).rejects.toThrow('Invalid pad ID');
    });
  });

  describe('getHealthyGoats', () => {
    it('should return healthy goats', async () => {
      const mockGoats = [
        { id: 1, pad_id: 1, name: 'Fleur', breed: 'Alpine', age: 4, milk_production: '3.5', health_status: 'healthy', pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', created_at: new Date() },
      ];
      mockGoatRepository.findHealthy.mockResolvedValue(mockGoats);

      const result = await service.getHealthyGoats();

      expect(mockGoatRepository.findHealthy).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('createGoat', () => {
    it('should create a new goat', async () => {
      const goatData = { pad_id: 1, name: 'Bella', breed: 'Saanen', age: 3, milk_production: 4.0 };
      const mockPad = { id: 1, name: 'Pasteur Alpine', location: 'Pyrénées', capacity: 20, price_per_day: '25.00', status: 'available', amenities: [] };
      const createdGoat = { id: 5, ...goatData, milk_production: '4.0', health_status: 'healthy', pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', created_at: new Date() };
      mockPadRepository.findById.mockResolvedValue(mockPad);
      mockGoatRepository.create.mockResolvedValue(createdGoat);

      const result = await service.createGoat(goatData);

      expect(mockPadRepository.findById).toHaveBeenCalledWith(1);
      expect(mockGoatRepository.create).toHaveBeenCalled();
      expect(result.name).toBe('Bella');
    });

    it('should throw error when pad not found', async () => {
      mockPadRepository.findById.mockResolvedValue(null);

      await expect(service.createGoat({ pad_id: 99, name: 'Bella', breed: 'Saanen' })).rejects.toThrow('Pad with ID 99 not found');
    });

    it('should throw error for missing pad_id', async () => {
      await expect(service.createGoat({ name: 'Bella', breed: 'Saanen' })).rejects.toThrow('Valid pad_id is required');
    });

    it('should throw error for missing name', async () => {
      await expect(service.createGoat({ pad_id: 1, breed: 'Saanen' })).rejects.toThrow('Goat name is required');
    });

    it('should throw error for missing breed', async () => {
      await expect(service.createGoat({ pad_id: 1, name: 'Bella' })).rejects.toThrow('Goat breed is required');
    });
  });

  describe('updateGoat', () => {
    it('should update a goat', async () => {
      const existingGoat = { id: 1, pad_id: 1, name: 'Fleur', breed: 'Alpine', age: 4, milk_production: '3.5', health_status: 'healthy', pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', created_at: new Date() };
      const updatedGoat = { id: 1, pad_id: 1, name: 'Fleur Updated', breed: 'Alpine', age: 5, milk_production: '3.8', health_status: 'healthy', pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', created_at: existingGoat.created_at };
      mockGoatRepository.findById.mockResolvedValue(existingGoat);
      mockGoatRepository.update.mockResolvedValue(updatedGoat);

      const result = await service.updateGoat(1, { name: 'Fleur Updated', age: 5, milk_production: 3.8 });

      expect(mockGoatRepository.findById).toHaveBeenCalledWith(1);
      expect(mockGoatRepository.update).toHaveBeenCalledWith(1, { name: 'Fleur Updated', age: 5, milk_production: 3.8 });
      expect(result.name).toBe('Fleur Updated');
    });

    it('should throw error when goat not found', async () => {
      mockGoatRepository.findById.mockResolvedValue(null);

      await expect(service.updateGoat(99, { name: 'New' })).rejects.toThrow('Goat with ID 99 not found');
    });
  });

  describe('deleteGoat', () => {
    it('should delete a goat', async () => {
      const existingGoat = { id: 1, pad_id: 1, name: 'Fleur', breed: 'Alpine', age: 4, milk_production: '3.5', health_status: 'healthy', pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', created_at: new Date() };
      mockGoatRepository.findById.mockResolvedValue(existingGoat);
      mockGoatRepository.delete.mockResolvedValue(true);

      const result = await service.deleteGoat(1);

      expect(mockGoatRepository.findById).toHaveBeenCalledWith(1);
      expect(mockGoatRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw error when goat not found', async () => {
      mockGoatRepository.findById.mockResolvedValue(null);

      await expect(service.deleteGoat(99)).rejects.toThrow('Goat with ID 99 not found');
    });
  });

  describe('getAverageMilkProduction', () => {
    it('should return average milk production', async () => {
      mockGoatRepository.getAverageMilkProduction.mockResolvedValue('3.5');

      const result = await service.getAverageMilkProduction(1);

      expect(mockGoatRepository.getAverageMilkProduction).toHaveBeenCalledWith(1);
      expect(result).toBe(3.5);
    });

    it('should throw error for invalid pad ID', async () => {
      await expect(service.getAverageMilkProduction(null)).rejects.toThrow('Invalid pad ID');
    });

    it('should return 0 when no goats', async () => {
      mockGoatRepository.getAverageMilkProduction.mockResolvedValue(0);

      const result = await service.getAverageMilkProduction(1);

      expect(result).toBe(0);
    });
  });
});