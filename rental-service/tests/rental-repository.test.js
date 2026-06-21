const RentalRepository = require('../src/data/rental-repository');

jest.mock('pg', () => {
  const mockQuery = jest.fn();
  const mockPool = {
    query: mockQuery,
  };
  const MockPg = jest.fn().mockReturnValue(mockPool);
  MockPg.Pool = jest.fn().mockReturnValue(mockPool);
  MockPg.query = mockQuery;
  return MockPg;
});

// Load the repository after pg is mocked
const pg = require('pg');

describe('RentalRepository', () => {
  let repository;

    beforeEach(() => {
    pg.Pool.mockClear();
    pg.query.mockClear();
    repository = new RentalRepository();
  });

  describe('findAll', () => {
    it('should return all rentals ordered by created_at DESC', async () => {
      const mockRentals = [
        { id: 1, goatIds: [1, 2], start_date: '2026-07-01', end_date: '2026-07-05', total_cost: 40, status: 'active', created_at: '2026-06-20T10:00:00Z' },
        { id: 2, goatIds: [3], start_date: '2026-07-10', end_date: '2026-07-12', total_cost: 16, status: 'completed', created_at: '2026-06-19T08:00:00Z' },
      ];
      pg.query.mockResolvedValue({ rows: mockRentals });

      const result = await repository.findAll();

      expect(result).toEqual(mockRentals);
      expect(pg.query).toHaveBeenCalledWith('SELECT * FROM rentals ORDER BY created_at DESC');
    });

    it('should return an empty array when no rentals exist', async () => {
      pg.query.mockResolvedValue({ rows: [] });

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a rental by id', async () => {
      const mockRental = { id: 1, goatIds: [1, 2], start_date: '2026-07-01', end_date: '2026-07-05', total_cost: 40, status: 'active', created_at: '2026-06-20T10:00:00Z' };
      pg.query.mockResolvedValue({ rows: [mockRental] });

      const result = await repository.findById(1);

      expect(result).toEqual(mockRental);
      expect(pg.query).toHaveBeenCalledWith('SELECT * FROM rentals WHERE id = $1', [1]);
    });

    it('should return null when rental not found', async () => {
      pg.query.mockResolvedValue({ rows: [] });

      const result = await repository.findById(99);

      expect(result).toBeNull();
    });
  });

  describe('findActive', () => {
    it('should return active rentals ordered by created_at DESC', async () => {
      const mockRentals = [
        { id: 1, goatIds: [1, 2], start_date: '2026-07-01', end_date: '2026-07-05', total_cost: 40, status: 'active', created_at: '2026-06-20T10:00:00Z' },
        { id: 3, goatIds: [4, 5], start_date: '2026-07-15', end_date: '2026-07-20', total_cost: 60, status: 'active', created_at: '2026-06-18T12:00:00Z' },
      ];
      pg.query.mockResolvedValue({ rows: mockRentals });

      const result = await repository.findActive();

      expect(result).toEqual(mockRentals);
      expect(pg.query).toHaveBeenCalledWith('SELECT * FROM rentals WHERE status = $1 ORDER BY created_at DESC', ['active']);
    });

    it('should return an empty array when no active rentals exist', async () => {
      pg.query.mockResolvedValue({ rows: [] });

      const result = await repository.findActive();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a rental and return the result', async () => {
      const mockRental = { id: 5, goatIds: [1, 2, 3], start_date: '2026-07-01', end_date: '2026-07-05', total_cost: 60, status: 'active', created_at: '2026-06-21T09:00:00Z' };
      pg.query.mockResolvedValue({ rows: [mockRental] });

      const result = await repository.create([1, 2, 3], '2026-07-01', '2026-07-05', 60);

      expect(result).toEqual(mockRental);
      expect(pg.query).toHaveBeenCalledWith(
        'INSERT INTO rentals (goat_ids, start_date, end_date, total_cost, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [ [1, 2, 3], '2026-07-01', '2026-07-05', 60, 'active' ]
      );
    });

    it('should create a rental with a single goat', async () => {
      const mockRental = { id: 6, goatIds: [4], start_date: '2026-08-01', end_date: '2026-08-03', total_cost: 16, status: 'active', created_at: '2026-06-21T10:00:00Z' };
      pg.query.mockResolvedValue({ rows: [mockRental] });

      const result = await repository.create([4], '2026-08-01', '2026-08-03', 16);

      expect(result).toEqual(mockRental);
      expect(pg.query).toHaveBeenCalledWith(
        'INSERT INTO rentals (goat_ids, start_date, end_date, total_cost, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [ [4], '2026-08-01', '2026-08-03', 16, 'active' ]
      );
    });
  });

  describe('updateStatus', () => {
    it('should update the rental status and return the result', async () => {
      const mockRental = { id: 1, goatIds: [1, 2], start_date: '2026-07-01', end_date: '2026-07-05', total_cost: 40, status: 'completed', created_at: '2026-06-20T10:00:00Z' };
      pg.query.mockResolvedValue({ rows: [mockRental] });

      const result = await repository.updateStatus(1, 'completed');

      expect(result).toEqual(mockRental);
      expect(pg.query).toHaveBeenCalledWith(
        'UPDATE rentals SET status = $1 WHERE id = $2 RETURNING *',
        ['completed', 1]
      );
    });

    it('should update the rental status to cancelled', async () => {
      const mockRental = { id: 2, goatIds: [3], start_date: '2026-07-10', end_date: '2026-07-12', total_cost: 16, status: 'cancelled', created_at: '2026-06-19T08:00:00Z' };
      pg.query.mockResolvedValue({ rows: [mockRental] });

      const result = await repository.updateStatus(2, 'cancelled');

      expect(result).toEqual(mockRental);
      expect(pg.query).toHaveBeenCalledWith(
        'UPDATE rentals SET status = $1 WHERE id = $2 RETURNING *',
        ['cancelled', 2]
      );
    });
  });

  describe('error handling', () => {
    it('should propagate database errors from findAll', async () => {
      const dbError = new Error('Connection refused');
      pg.query.mockRejectedValue(dbError);

      await expect(repository.findAll()).rejects.toThrow('Connection refused');
    });

    it('should propagate database errors from findById', async () => {
      const dbError = new Error('Connection refused');
      pg.query.mockRejectedValue(dbError);

      await expect(repository.findById(1)).rejects.toThrow('Connection refused');
    });

    it('should propagate database errors from create', async () => {
      const dbError = new Error('Connection refused');
      pg.query.mockRejectedValue(dbError);

      await expect(repository.create([1], '2026-07-01', '2026-07-05', 16)).rejects.toThrow('Connection refused');
    });

    it('should propagate database errors from updateStatus', async () => {
      const dbError = new Error('Connection refused');
      pg.query.mockRejectedValue(dbError);

      await expect(repository.updateStatus(1, 'completed')).rejects.toThrow('Connection refused');
    });
  });
});