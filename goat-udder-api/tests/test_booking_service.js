const BookingService = require('../src/services/booking_service');
const BookingRepository = require('../src/data/repositories/booking_repository');
const PadRepository = require('../src/data/repositories/pad_repository');

// Mock repositories
const mockBookingRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByPadId: jest.fn(),
  findActive: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  calculateDays: jest.fn(),
};

const mockPadRepository = {
  findById: jest.fn(),
};

jest.mock('../src/data/repositories/booking_repository');
BookingRepository.mockImplementation(() => mockBookingRepository);

jest.mock('../src/data/repositories/pad_repository');
PadRepository.mockImplementation(() => mockPadRepository);

describe('BookingService', () => {
  let service;

  beforeEach(() => {
    service = new BookingService();
    jest.clearAllMocks();
  });

  describe('getAllBookings', () => {
    it('should return all bookings formatted', async () => {
      const mockBookings = [
        { id: 1, pad_id: 1, user_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: '100.00', status: 'active', created_at: new Date() },
      ];
      mockBookingRepository.findAll.mockResolvedValue(mockBookings);

      const result = await service.getAllBookings();

      expect(mockBookingRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].total_price).toBe(100.00);
    });
  });

  describe('getBookingById', () => {
    it('should return booking by ID', async () => {
      const mockBooking = { id: 1, pad_id: 1, user_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: '100.00', status: 'active', created_at: new Date() };
      mockBookingRepository.findById.mockResolvedValue(mockBooking);

      const result = await service.getBookingById(1);

      expect(mockBookingRepository.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });

    it('should throw error when booking not found', async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(service.getBookingById(99)).rejects.toThrow('Booking with ID 99 not found');
    });

    it('should throw error for invalid ID', async () => {
      await expect(service.getBookingById(null)).rejects.toThrow('Invalid booking ID');
    });
  });

  describe('getBookingsByUserId', () => {
    it('should return bookings by user ID', async () => {
      const mockBookings = [
        { id: 1, pad_id: 1, user_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: '100.00', status: 'active', created_at: new Date() },
      ];
      mockBookingRepository.findByUserId.mockResolvedValue(mockBookings);

      const result = await service.getBookingsByUserId(1);

      expect(mockBookingRepository.findByUserId).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });

    it('should throw error for invalid user ID', async () => {
      await expect(service.getBookingsByUserId(null)).rejects.toThrow('Invalid user ID');
    });
  });

  describe('getBookingsByPadId', () => {
    it('should return bookings by pad ID', async () => {
      const mockBookings = [
        { id: 1, pad_id: 1, user_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: '100.00', status: 'active', created_at: new Date() },
      ];
      mockBookingRepository.findByPadId.mockResolvedValue(mockBookings);

      const result = await service.getBookingsByPadId(1);

      expect(mockBookingRepository.findByPadId).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });

    it('should throw error for invalid pad ID', async () => {
      await expect(service.getBookingsByPadId(null)).rejects.toThrow('Invalid pad ID');
    });
  });

  describe('createBooking', () => {
    it('should create a new booking with calculated price', async () => {
      const bookingData = { pad_id: 1, user_id: 1, start_date: '2026-07-01', end_date: '2026-07-05' };
      const mockPad = { id: 1, name: 'Pasteur Alpine', location: 'Pyrénées', capacity: 20, price_per_day: '25.00', status: 'available', amenities: [] };
      const createdBooking = { id: 5, ...bookingData, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', total_price: '100.00', status: 'pending', created_at: new Date() };
      mockPadRepository.findById.mockResolvedValue(mockPad);
      mockBookingRepository.calculateDays.mockResolvedValue(4);
      mockBookingRepository.create.mockResolvedValue(createdBooking);

      const result = await service.createBooking(bookingData);

      expect(mockPadRepository.findById).toHaveBeenCalledWith(1);
      expect(mockBookingRepository.calculateDays).toHaveBeenCalledWith('2026-07-01', '2026-07-05');
      expect(mockBookingRepository.create).toHaveBeenCalled();
      expect(result.total_price).toBe(100.00);
    });

    it('should throw error when pad not found', async () => {
      mockPadRepository.findById.mockResolvedValue(null);

      await expect(service.createBooking({ pad_id: 99, user_id: 1, start_date: '2026-07-01', end_date: '2026-07-05' })).rejects.toThrow('Pad with ID 99 not found');
    });

    it('should throw error when pad not available', async () => {
      const mockPad = { id: 1, name: 'Occupied Pad', location: 'L', capacity: 10, price_per_day: '15.00', status: 'occupied', amenities: [] };
      mockPadRepository.findById.mockResolvedValue(mockPad);

      await expect(service.createBooking({ pad_id: 1, user_id: 1, start_date: '2026-07-01', end_date: '2026-07-05' })).rejects.toThrow('Pad "Occupied Pad" is not available');
    });

    it('should throw error for missing pad_id', async () => {
      await expect(service.createBooking({ user_id: 1, start_date: '2026-07-01', end_date: '2026-07-05' })).rejects.toThrow('Valid pad_id is required');
    });

    it('should throw error for missing user_id', async () => {
      await expect(service.createBooking({ pad_id: 1, start_date: '2026-07-01', end_date: '2026-07-05' })).rejects.toThrow('Valid user_id is required');
    });

    it('should throw error for missing start_date', async () => {
      await expect(service.createBooking({ pad_id: 1, user_id: 1, end_date: '2026-07-05' })).rejects.toThrow('start_date is required');
    });

    it('should throw error for missing end_date', async () => {
      await expect(service.createBooking({ pad_id: 1, user_id: 1, start_date: '2026-07-01' })).rejects.toThrow('end_date is required');
    });

    it('should throw error when end_date before start_date', async () => {
      await expect(service.createBooking({ pad_id: 1, user_id: 1, start_date: '2026-07-05', end_date: '2026-07-01' })).rejects.toThrow('end_date must be after start_date');
    });
  });

  describe('updateBooking', () => {
    it('should update a booking', async () => {
      const existingBooking = { id: 1, pad_id: 1, user_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: '100.00', status: 'pending', created_at: new Date() };
      const updatedBooking = { id: 1, ...existingBooking, status: 'active', total_price: '100.00' };
      mockBookingRepository.findById.mockResolvedValue(existingBooking);
      mockBookingRepository.update.mockResolvedValue(updatedBooking);

      const result = await service.updateBooking(1, { status: 'active' });

      expect(mockBookingRepository.findById).toHaveBeenCalledWith(1);
      expect(mockBookingRepository.update).toHaveBeenCalledWith(1, { status: 'active' });
      expect(result.status).toBe('active');
    });

    it('should throw error when booking not found', async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(service.updateBooking(99, { status: 'active' })).rejects.toThrow('Booking with ID 99 not found');
    });

    it('should throw error for completed booking', async () => {
      const existingBooking = { id: 1, pad_id: 1, user_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: '100.00', status: 'completed', created_at: new Date() };
      mockBookingRepository.findById.mockResolvedValue(existingBooking);

      await expect(service.updateBooking(1, { status: 'active' })).rejects.toThrow('Cannot update a completed booking');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking', async () => {
      const existingBooking = { id: 1, pad_id: 1, user_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: '100.00', status: 'active', created_at: new Date() };
      const updatedBooking = { id: 1, ...existingBooking, status: 'cancelled' };
      mockBookingRepository.findById.mockResolvedValue(existingBooking);
      mockBookingRepository.update.mockResolvedValue(updatedBooking);

      const result = await service.cancelBooking(1);

      expect(mockBookingRepository.update).toHaveBeenCalledWith(1, { status: 'cancelled' });
      expect(result.status).toBe('cancelled');
    });

    it('should throw error when booking not found', async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(service.cancelBooking(99)).rejects.toThrow('Booking with ID 99 not found');
    });

    it('should throw error for completed booking', async () => {
      const existingBooking = { id: 1, pad_id: 1, user_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: '100.00', status: 'completed', created_at: new Date() };
      mockBookingRepository.findById.mockResolvedValue(existingBooking);

      await expect(service.cancelBooking(1)).rejects.toThrow('Cannot cancel a completed booking');
    });
  });

  describe('completeBooking', () => {
    it('should complete a booking', async () => {
      const existingBooking = { id: 1, pad_id: 1, user_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: '100.00', status: 'active', created_at: new Date() };
      const updatedBooking = { id: 1, ...existingBooking, status: 'completed' };
      mockBookingRepository.findById.mockResolvedValue(existingBooking);
      mockBookingRepository.update.mockResolvedValue(updatedBooking);

      const result = await service.completeBooking(1);

      expect(mockBookingRepository.update).toHaveBeenCalledWith(1, { status: 'completed' });
      expect(result.status).toBe('completed');
    });

    it('should throw error when booking not found', async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(service.completeBooking(99)).rejects.toThrow('Booking with ID 99 not found');
    });

    it('should throw error for non-active booking', async () => {
      const existingBooking = { id: 1, pad_id: 1, user_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: '100.00', status: 'pending', created_at: new Date() };
      mockBookingRepository.findById.mockResolvedValue(existingBooking);

      await expect(service.completeBooking(1)).rejects.toThrow('Only active bookings can be completed');
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking', async () => {
      const existingBooking = { id: 1, pad_id: 1, user_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: '100.00', status: 'pending', created_at: new Date() };
      mockBookingRepository.findById.mockResolvedValue(existingBooking);
      mockBookingRepository.delete.mockResolvedValue(true);

      const result = await service.deleteBooking(1);

      expect(mockBookingRepository.findById).toHaveBeenCalledWith(1);
      expect(mockBookingRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw error when booking not found', async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(service.deleteBooking(99)).rejects.toThrow('Booking with ID 99 not found');
    });
  });
});