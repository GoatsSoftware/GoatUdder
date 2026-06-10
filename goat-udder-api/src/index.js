const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./data/database');
const PadController = require('./controllers/pad_controller');
const UserController = require('./controllers/user_controller');
const BookingController = require('./controllers/booking_controller');
const GoatController = require('./controllers/goat_controller');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Controllers instances
const padController = new PadController();
const userController = new UserController();
const bookingController = new BookingController();
const goatController = new GoatController();

// Routes - Pads
app.get('/api/pads', padController.getAllPads.bind(padController));
app.get('/api/pads/available', padController.getAvailablePads.bind(padController));
app.get('/api/pads/:id', padController.getPadById.bind(padController));
app.post('/api/pads', padController.createPad.bind(padController));
app.put('/api/pads/:id', padController.updatePad.bind(padController));
app.delete('/api/pads/:id', padController.deletePad.bind(padController));

// Routes - Users
app.get('/api/users', userController.getAllUsers.bind(userController));
app.get('/api/users/:id', userController.getUserById.bind(userController));
app.post('/api/users/register', userController.register.bind(userController));
app.post('/api/users/login', userController.login.bind(userController));
app.put('/api/users/:id', userController.updateUser.bind(userController));
app.delete('/api/users/:id', userController.deleteUser.bind(userController));

// Routes - Bookings
app.get('/api/bookings', bookingController.getAllBookings.bind(bookingController));
app.get('/api/bookings/active', bookingController.getActiveBookings.bind(bookingController));
app.get('/api/bookings/:id', bookingController.getBookingById.bind(bookingController));
app.get('/api/bookings/user/:userId', bookingController.getBookingsByUserId.bind(bookingController));
app.get('/api/bookings/pad/:padId', bookingController.getBookingsByPadId.bind(bookingController));
app.post('/api/bookings', bookingController.createBooking.bind(bookingController));
app.put('/api/bookings/:id', bookingController.updateBooking.bind(bookingController));
app.put('/api/bookings/:id/cancel', bookingController.cancelBooking.bind(bookingController));
app.put('/api/bookings/:id/complete', bookingController.completeBooking.bind(bookingController));
app.delete('/api/bookings/:id', bookingController.deleteBooking.bind(bookingController));

// Routes - Goats
app.get('/api/goats', goatController.getAllGoats.bind(goatController));
app.get('/api/goats/:id', goatController.getGoatById.bind(goatController));
app.get('/api/goats/pad/:padId', goatController.getGoatsByPadId.bind(goatController));
app.get('/api/goats/healthy', goatController.getHealthyGoats.bind(goatController));
app.get('/api/goats/pad/:padId/milk-production', goatController.getAverageMilkProduction.bind(goatController));
app.post('/api/goats', goatController.createGoat.bind(goatController));
app.put('/api/goats/:id', goatController.updateGoat.bind(goatController));
app.delete('/api/goats/:id', goatController.deleteGoat.bind(goatController));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'goat-udder-api' });
});

// Start server
async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`GoatUdder API running on port ${PORT}`);
  });
}

// Only start server when run directly
if (require.main === module) {
  start();
}

module.exports = app;
