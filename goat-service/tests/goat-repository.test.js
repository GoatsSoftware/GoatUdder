const pg = require('pg');

jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    end: jest.fn(),
  };
  return {
    Pool: jest.fn().mockReturnValue(mockPool),
  };
});

const GoatRepository = require('../src/data/goat-repository');

describe('GoatRepository', () => {
  let repository;
  let mockPool;

  beforeEach(() => {
    mockPool = pg.Pool.mock.results[0].value;
    mockPool.query.mockClear();
    repository = new GoatRepository();
  });

  describe('findAll', () => {
    it('should return all goats', async () => {
      const mockGoats = [
        { id: 1, name: 'Aglaé', status: 'available' },
        { id: 2, name: 'Babette', status: 'rented' },
      ];
      mockPool.query.mockResolvedValue({ rows: mockGoats });

      const result = await repository.findAll();

      expect(result).toEqual(mockGoats);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM goats ORDER BY id');
    });

    it('should return empty array when no goats', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a goat by id', async () => {
      const mockGoat = { id: 1, name: 'Aglaé', status: 'available' };
      mockPool.query.mockResolvedValue({ rows: [mockGoat] });

      const result = await repository.findById(1);

      expect(result).toEqual(mockGoat);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM goats WHERE id = $1', [1]);
    });

    it('should return null when goat not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await repository.findById(99);

      expect(result).toBeNull();
    });
  });

  describe('findAvailable', () => {
    it('should return available goats', async () => {
      const mockGoats = [{ id: 1, name: 'Aglaé', status: 'available' }];
      mockPool.query.mockResolvedValue({ rows: mockGoats });

      const result = await repository.findAvailable();

      expect(result).toEqual(mockGoats);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM goats WHERE status = $1 ORDER BY id',
        ['available']
      );
    });

    it('should return empty array when no available goats', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await repository.findAvailable();

      expect(result).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('should update goat status and return updated goat', async () => {
      const updatedGoat = { id: 1, name: 'Aglaé', status: 'rented' };
      mockPool.query.mockResolvedValue({ rows: [updatedGoat] });

      const result = await repository.updateStatus(1, 'rented');

      expect(result).toEqual(updatedGoat);
      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE goats SET status = $1 WHERE id = $2 RETURNING *',
        ['rented', 1]
      );
    });

    it('should return null when updating non-existent goat', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await repository.updateStatus(99, 'rented');

      expect(result).toBeUndefined();
    });
  });
});