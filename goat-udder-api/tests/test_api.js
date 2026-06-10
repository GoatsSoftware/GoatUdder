const request = require('supertest');

// Mock pg module to prevent Pool creation
jest.mock('pg', () => ({
  Pool: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    }),
  }),
}));

// Mock the database module
jest.mock('../src/data/database', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
}));

// Mock the controllers to return fake data without calling real services
const mockPadController = {
  getAllPads: jest.fn(),
  getAvailablePads: jest.fn(),
  getPadById: jest.fn(),
  createPad: jest.fn(),
  updatePad: jest.fn(),
  deletePad: jest.fn(),
};

const mockUserController = {
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  register: jest.fn(),
  login: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

const mockBookingController = {
  getAllBookings: jest.fn(),
  getActiveBookings: jest.fn(),
  getBookingById: jest.fn(),
  getBookingsByUserId: jest.fn(),
  getBookingsByPadId: jest.fn(),
  createBooking: jest.fn(),
  updateBooking: jest.fn(),
  cancelBooking: jest.fn(),
  completeBooking: jest.fn(),
  deleteBooking: jest.fn(),
};

const mockGoatController = {
  getAllGoats: jest.fn(),
  getGoatById: jest.fn(),
  getGoatsByPadId: jest.fn(),
  getHealthyGoats: jest.fn(),
  getAverageMilkProduction: jest.fn(),
  createGoat: jest.fn(),
  updateGoat: jest.fn(),
  deleteGoat: jest.fn(),
};

// Mock the controller modules
jest.mock('../src/controllers/pad_controller', () => {
  return class PadController {
    constructor() {
      this.service = mockPadController;
    }
  };
});

jest.mock('../src/controllers/user_controller', () => {
  return class UserController {
    constructor() {
      this.service = mockUserController;
    }
  };
});

jest.mock('../src/controllers/booking_controller', () => {
  return class BookingController {
    constructor() {
      this.service = mockBookingController;
    }
  };
});

jest.mock('../src/controllers/goat_controller', () => {
  return class GoatController {
    constructor() {
      this.service = mockGoatController;
    }
  };
});

// Now import the app
const app = require('../src/index');

describe('GoatUdder API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock responses
    mockPadController.getAllPads.mockImplementation((req, res) => {
      res.json({ success: true, data: [{ id: 1, name: 'Pasteur Alpine', location: 'Pyrénées', capacity: 20, price_per_day: 25.00, amenities: ['grazing_area'], status: 'available', created_at: new Date() }], count: 1 });
    });
    mockPadController.getAvailablePads.mockImplementation((req, res) => {
      res.json({ success: true, data: [{ id: 1, name: 'Pasteur Alpine', location: 'Pyrénées', capacity: 20, price_per_day: 25.00, amenities: [], status: 'available', created_at: new Date() }], count: 1 });
    });
    mockPadController.getPadById.mockImplementation((req, res) => {
      res.json({ success: true, data: { id: 1, name: 'Pasteur Alpine', location: 'Pyrénées', capacity: 20, price_per_day: 25.00, amenities: [], status: 'available', created_at: new Date() } });
    });
    mockPadController.createPad.mockImplementation((req, res) => {
      res.status(201).json({ success: true, data: { id: 5, name: req.body.name, location: req.body.location, capacity: req.body.capacity, price_per_day: req.body.price_per_day, amenities: [], status: 'available', created_at: new Date() } });
    });
    mockPadController.updatePad.mockImplementation((req, res) => {
      res.json({ success: true, data: { id: 1, name: req.body.name, location: 'Pyrénées', capacity: 20, price_per_day: req.body.price_per_day, amenities: [], status: 'available', created_at: new Date() } });
    });
    mockPadController.deletePad.mockImplementation((req, res) => {
      res.json({ success: true, message: 'Pad deleted successfully' });
    });

    mockUserController.getAllUsers.mockImplementation((req, res) => {
      res.json({ success: true, data: [{ id: 1, username: 'goatlover', email: 'goat@example.com', role: 'customer', created_at: new Date() }], count: 1 });
    });
    mockUserController.getUserById.mockImplementation((req, res) => {
      res.json({ success: true, data: { id: 1, username: 'goatlover', email: 'goat@example.com', role: 'customer', created_at: new Date() } });
    });
    mockUserController.register.mockImplementation((req, res) => {
      res.status(201).json({ success: true, data: { id: 2, username: req.body.username, email: req.body.email, role: 'customer', created_at: new Date() } });
    });
    mockUserController.login.mockImplementation((req, res) => {
      res.json({ success: true, data: { user: { id: 1, username: req.body.username, email: 'goat@example.com', role: 'customer', created_at: new Date() }, token: 'mock-token' } });
    });
    mockUserController.updateUser.mockImplementation((req, res) => {
      res.json({ success: true, data: { id: 1, username: req.body.username, email: 'goat@example.com', role: req.body.role, created_at: new Date() } });
    });
    mockUserController.deleteUser.mockImplementation((req, res) => {
      res.json({ success: true, message: 'User deleted successfully' });
    });

    mockBookingController.getAllBookings.mockImplementation((req, res) => {
      res.json({ success: true, data: [{ id: 1, pad_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_id: 1, user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: 100.00, status: 'active', created_at: new Date() }], count: 1 });
    });
    mockBookingController.getActiveBookings.mockImplementation((req, res) => {
      res.json({ success: true, data: [], count: 0 });
    });
    mockBookingController.getBookingById.mockImplementation((req, res) => {
      res.json({ success: true, data: { id: 1, pad_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_id: 1, user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: 100.00, status: 'active', created_at: new Date() } });
    });
    mockBookingController.getBookingsByUserId.mockImplementation((req, res) => {
      res.json({ success: true, data: [], count: 0 });
    });
    mockBookingController.getBookingsByPadId.mockImplementation((req, res) => {
      res.json({ success: true, data: [], count: 0 });
    });
    mockBookingController.createBooking.mockImplementation((req, res) => {
      res.status(201).json({ success: true, data: { id: 5, pad_id: req.body.pad_id, user_id: req.body.user_id, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_name: 'goatlover', start_date: req.body.start_date, end_date: req.body.end_date, total_price: 100.00, status: 'pending', created_at: new Date() } });
    });
    mockBookingController.updateBooking.mockImplementation((req, res) => {
      res.json({ success: true, data: { id: 1, pad_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_id: 1, user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: 100.00, status: req.body.status, created_at: new Date() } });
    });
    mockBookingController.cancelBooking.mockImplementation((req, res) => {
      res.json({ success: true, data: { id: 1, pad_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_id: 1, user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: 100.00, status: 'cancelled', created_at: new Date() } });
    });
    mockBookingController.completeBooking.mockImplementation((req, res) => {
      res.json({ success: true, data: { id: 1, pad_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', user_id: 1, user_name: 'goatlover', start_date: '2026-07-01', end_date: '2026-07-05', total_price: 100.00, status: 'completed', created_at: new Date() } });
    });
    mockBookingController.deleteBooking.mockImplementation((req, res) => {
      res.json({ success: true, message: 'Booking deleted successfully' });
    });

    mockGoatController.getAllGoats.mockImplementation((req, res) => {
      res.json({ success: true, data: [{ id: 1, pad_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', name: 'Fleur', breed: 'Alpine', age: 4, milk_production: 3.5, health_status: 'healthy', created_at: new Date() }], count: 1 });
    });
    mockGoatController.getGoatById.mockImplementation((req, res) => {
      res.json({ success: true, data: { id: 1, pad_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', name: 'Fleur', breed: 'Alpine', age: 4, milk_production: 3.5, health_status: 'healthy', created_at: new Date() } });
    });
    mockGoatController.getGoatsByPadId.mockImplementation((req, res) => {
      res.json({ success: true, data: [], count: 0 });
    });
    mockGoatController.getHealthyGoats.mockImplementation((req, res) => {
      res.json({ success: true, data: [], count: 0 });
    });
    mockGoatController.getAverageMilkProduction.mockImplementation((req, res) => {
      res.json({ success: true, data: { pad_id: parseInt(req.params.padId), average_milk_production: 3.5 } });
    });
    mockGoatController.createGoat.mockImplementation((req, res) => {
      res.status(201).json({ success: true, data: { id: 5, pad_id: req.body.pad_id, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', name: req.body.name, breed: req.body.breed, age: req.body.age, milk_production: req.body.milk_production, health_status: 'healthy', created_at: new Date() } });
    });
    mockGoatController.updateGoat.mockImplementation((req, res) => {
      res.json({ success: true, data: { id: 1, pad_id: 1, pad_name: 'Pasteur Alpine', pad_location: 'Pyrénées', name: req.body.name, breed: req.body.breed, age: req.body.age, milk_production: req.body.milk_production, health_status: 'healthy', created_at: new Date() } });
    });
    mockGoatController.deleteGoat.mockImplementation((req, res) => {
      res.json({ success: true, message: 'Goat deleted successfully' });
    });
  });

  describe('Health Check', () => {
    it('GET /health should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'healthy', service: 'goat-udder-api' });
    });
  });

  describe('Pads API', () => {
    it('GET /api/pads should return all pads', async () => {
      const response = await request(app).get('/api/pads');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(mockPadController.getAllPads).toHaveBeenCalled();
    });

    it('GET /api/pads/available should return available pads', async () => {
      const response = await request(app).get('/api/pads/available');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPadController.getAvailablePads).toHaveBeenCalled();
    });

    it('GET /api/pads/:id should return pad by ID', async () => {
      const response = await request(app).get('/api/pads/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(mockPadController.getPadById).toHaveBeenCalled();
    });

    it('GET /api/pads/:id should return 404 for non-existent pad', async () => {
      mockPadController.getPadById.mockImplementation((req, res) => {
        if (req.params.id === '99') {
          return res.status(404).json({ success: false, error: 'Pad with ID 99 not found' });
        }
        return res.json({ success: true, data: { id: 1, name: 'Pasteur Alpine' } });
      });

      const response = await request(app).get('/api/pads/99');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('POST /api/pads should create a new pad', async () => {
      const response = await request(app).post('/api/pads').send({
        name: 'New Pad',
        location: 'Location',
        capacity: 10,
        price_per_day: 15.00,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Pad');
      expect(mockPadController.createPad).toHaveBeenCalled();
    });

    it('POST /api/pads should return 400 for invalid data', async () => {
      mockPadController.createPad.mockImplementation((req, res) => {
        if (!req.body.name) {
          return res.status(400).json({ success: false, error: 'Pad name is required' });
        }
        return res.status(201).json({ success: true, data: { name: req.body.name } });
      });

      const response = await request(app).post('/api/pads').send({
        capacity: 10,
        price_per_day: 15.00,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('PUT /api/pads/:id should update a pad', async () => {
      const response = await request(app).put('/api/pads/1').send({
        name: 'Updated Pad',
        price_per_day: 30.00,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Pad');
      expect(mockPadController.updatePad).toHaveBeenCalled();
    });

    it('DELETE /api/pads/:id should delete a pad', async () => {
      const response = await request(app).delete('/api/pads/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Pad deleted successfully');
      expect(mockPadController.deletePad).toHaveBeenCalled();
    });
  });

  describe('Users API', () => {
    it('GET /api/users should return all users', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockUserController.getAllUsers).toHaveBeenCalled();
    });

    it('GET /api/users/:id should return user by ID', async () => {
      const response = await request(app).get('/api/users/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(mockUserController.getUserById).toHaveBeenCalled();
    });

    it('POST /api/users/register should register a new user', async () => {
      const response = await request(app).post('/api/users/register').send({
        username: 'newgoat',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('newgoat');
      expect(mockUserController.register).toHaveBeenCalled();
    });

    it('POST /api/users/login should login successfully', async () => {
      const response = await request(app).post('/api/users/login').send({
        username: 'goatlover',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(mockUserController.login).toHaveBeenCalled();
    });

    it('POST /api/users/login should return 401 for wrong credentials', async () => {
      mockUserController.login.mockImplementation((req, res) => {
        if (req.body.username === 'unknown') {
          return res.status(401).json({ success: false, error: 'Invalid username or password' });
        }
        return res.json({ success: true, data: { token: 'mock-token' } });
      });

      const response = await request(app).post('/api/users/login').send({
        username: 'unknown',
        password: 'wrong',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('PUT /api/users/:id should update a user', async () => {
      const response = await request(app).put('/api/users/1').send({
        username: 'updated',
        role: 'admin',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('updated');
      expect(mockUserController.updateUser).toHaveBeenCalled();
    });

    it('DELETE /api/users/:id should delete a user', async () => {
      const response = await request(app).delete('/api/users/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');
      expect(mockUserController.deleteUser).toHaveBeenCalled();
    });
  });

  describe('Bookings API', () => {
    it('GET /api/bookings should return all bookings', async () => {
      const response = await request(app).get('/api/bookings');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockBookingController.getAllBookings).toHaveBeenCalled();
    });

    it('GET /api/bookings/active should return active bookings', async () => {
      const response = await request(app).get('/api/bookings/active');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockBookingController.getActiveBookings).toHaveBeenCalled();
    });

    it('GET /api/bookings/:id should return booking by ID', async () => {
      const response = await request(app).get('/api/bookings/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(mockBookingController.getBookingById).toHaveBeenCalled();
    });

    it('GET /api/bookings/user/:userId should return bookings by user', async () => {
      const response = await request(app).get('/api/bookings/user/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockBookingController.getBookingsByUserId).toHaveBeenCalled();
    });

    it('GET /api/bookings/pad/:padId should return bookings by pad', async () => {
      const response = await request(app).get('/api/bookings/pad/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockBookingController.getBookingsByPadId).toHaveBeenCalled();
    });

    it('POST /api/bookings should create a new booking', async () => {
      const response = await request(app).post('/api/bookings').send({
        pad_id: 1,
        user_id: 1,
        start_date: '2026-07-01',
        end_date: '2026-07-05',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_price).toBe(100.00);
      expect(mockBookingController.createBooking).toHaveBeenCalled();
    });

    it('PUT /api/bookings/:id should update a booking', async () => {
      const response = await request(app).put('/api/bookings/1').send({
        status: 'active',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('active');
      expect(mockBookingController.updateBooking).toHaveBeenCalled();
    });

    it('PUT /api/bookings/:id/cancel should cancel a booking', async () => {
      const response = await request(app).put('/api/bookings/1/cancel');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
      expect(mockBookingController.cancelBooking).toHaveBeenCalled();
    });

    it('PUT /api/bookings/:id/complete should complete a booking', async () => {
      const response = await request(app).put('/api/bookings/1/complete');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(mockBookingController.completeBooking).toHaveBeenCalled();
    });

    it('DELETE /api/bookings/:id should delete a booking', async () => {
      const response = await request(app).delete('/api/bookings/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Booking deleted successfully');
      expect(mockBookingController.deleteBooking).toHaveBeenCalled();
    });
  });

  describe('Goats API', () => {
    it('GET /api/goats should return all goats', async () => {
      const response = await request(app).get('/api/goats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(mockGoatController.getAllGoats).toHaveBeenCalled();
    });

    it('GET /api/goats/:id should return goat by ID', async () => {
      const response = await request(app).get('/api/goats/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(mockGoatController.getGoatById).toHaveBeenCalled();
    });

    it('GET /api/goats/pad/:padId should return goats by pad', async () => {
      const response = await request(app).get('/api/goats/pad/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockGoatController.getGoatsByPadId).toHaveBeenCalled();
    });

    it('GET /api/goats/healthy should return healthy goats', async () => {
      const response = await request(app).get('/api/goats/healthy');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockGoatController.getHealthyGoats).toHaveBeenCalled();
    });

    it('GET /api/goats/pad/:padId/milk-production should return milk production', async () => {
      const response = await request(app).get('/api/goats/pad/1/milk-production');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.average_milk_production).toBe(3.5);
      expect(mockGoatController.getAverageMilkProduction).toHaveBeenCalled();
    });

    it('POST /api/goats should create a new goat', async () => {
      const response = await request(app).post('/api/goats').send({
        pad_id: 1,
        name: 'Bella',
        breed: 'Saanen',
        age: 3,
        milk_production: 4.0,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Bella');
      expect(mockGoatController.createGoat).toHaveBeenCalled();
    });

    it('PUT /api/goats/:id should update a goat', async () => {
      const response = await request(app).put('/api/goats/1').send({
        name: 'Fleur Updated',
        age: 5,
        milk_production: 3.8,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Fleur Updated');
      expect(mockGoatController.updateGoat).toHaveBeenCalled();
    });

    it('DELETE /api/goats/:id should delete a goat', async () => {
      const response = await request(app).delete('/api/goats/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Goat deleted successfully');
      expect(mockGoatController.deleteGoat).toHaveBeenCalled();
    });
  });
});