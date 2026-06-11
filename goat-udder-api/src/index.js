const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initializeDatabase } = require("./data/database");
const UdderController = require("./controllers/udder_controller");
const UserController = require("./controllers/user_controller");
const BookingController = require("./controllers/booking_controller");
const GoatController = require("./controllers/goat_controller");
const { authenticate } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Controllers instances
const udderController = new UdderController();
const userController = new UserController();
const bookingController = new BookingController();
const goatController = new GoatController();

// Routes - Pis de chèvre
app.get("/api/udder", udderController.getAllUdders.bind(udderController));
app.get("/api/udder/available", udderController.getAvailableUdders.bind(udderController));
app.get("/api/udder/:id", udderController.getUdderById.bind(udderController));
app.post("/api/udder", authenticate, udderController.createUdder.bind(udderController));
app.put("/api/udder/:id", authenticate, udderController.updateUdder.bind(udderController));
app.delete("/api/udder/:id", authenticate, udderController.deleteUdder.bind(udderController));

// Routes - Users
app.get("/api/users", authenticate, userController.getAllUsers.bind(userController));
app.get("/api/users/:id", authenticate, userController.getUserById.bind(userController));
app.post("/api/users/register", userController.register.bind(userController));
app.post("/api/users/login", userController.login.bind(userController));
app.put("/api/users/:id", authenticate, userController.updateUser.bind(userController));
app.delete("/api/users/:id", authenticate, userController.deleteUser.bind(userController));

// Routes - Bookings
app.get("/api/bookings", authenticate, bookingController.getAllBookings.bind(bookingController));
app.get("/api/bookings/active", authenticate, bookingController.getActiveBookings.bind(bookingController));
app.get("/api/bookings/:id", authenticate, bookingController.getBookingById.bind(bookingController));
app.get("/api/bookings/user/:userId", authenticate, bookingController.getBookingsByUserId.bind(bookingController));
app.get("/api/bookings/udder/:udderId", authenticate, bookingController.getBookingsByUdderId.bind(bookingController));
app.post("/api/bookings", authenticate, bookingController.createBooking.bind(bookingController));
app.put("/api/bookings/:id", authenticate, bookingController.updateBooking.bind(bookingController));
app.put("/api/bookings/:id/cancel", authenticate, bookingController.cancelBooking.bind(bookingController));
app.put("/api/bookings/:id/complete", authenticate, bookingController.completeBooking.bind(bookingController));
app.delete("/api/bookings/:id", authenticate, bookingController.deleteBooking.bind(bookingController));

// Routes - Goats
app.get("/api/goats", authenticate, goatController.getAllGoats.bind(goatController));
app.get("/api/goats/:id", authenticate, goatController.getGoatById.bind(goatController));
app.get("/api/goats/udder/:udderId", authenticate, goatController.getGoatsByUdderId.bind(goatController));
app.get("/api/goats/healthy", authenticate, goatController.getHealthyGoats.bind(goatController));
app.get("/api/goats/udder/:udderId/milk-production", authenticate, goatController.getAverageMilkProduction.bind(goatController));
app.post("/api/goats", authenticate, goatController.createGoat.bind(goatController));
app.put("/api/goats/:id", authenticate, goatController.updateGoat.bind(goatController));
app.delete("/api/goats/:id", authenticate, goatController.deleteGoat.bind(goatController));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "goat-udder-api" });
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