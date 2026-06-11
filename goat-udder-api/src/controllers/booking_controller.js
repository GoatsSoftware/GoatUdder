const BookingService = require('../services/booking_service');

// Booking Controller - REST API handlers for bookings
class BookingController {
  constructor() {
    this.service = new BookingService();
  }

  // GET /api/bookings - Get all bookings
  async getAllBookings(req, res) {
    try {
      const bookings = await this.service.getAllBookings();
      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/bookings/active - Get active bookings
  async getActiveBookings(req, res) {
    try {
      const bookings = await this.service.getActiveBookings();
      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/bookings/:id - Get booking by ID
  async getBookingById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const booking = await this.service.getBookingById(id);
      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  }

  // GET /api/bookings/user/:userId - Get bookings by user ID
  async getBookingsByUserId(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      const bookings = await this.service.getBookingsByUserId(userId);
      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/bookings/udder/:udderId - Get bookings by udder ID
  async getBookingsByUdderId(req, res) {
    try {
      const udderId = parseInt(req.params.udderId);
      const bookings = await this.service.getBookingsByUdderId(udderId);
      res.json({
        success: true,
        data: bookings,
        count: bookings.length
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/bookings - Create a new booking
  async createBooking(req, res) {
    try {
      const bookingData = req.body;
      const booking = await this.service.createBooking(bookingData);
      res.status(201).json({
        success: true,
        data: booking
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/bookings/:id - Update a booking
  async updateBooking(req, res) {
    try {
      const id = parseInt(req.params.id);
      const bookingData = req.body;
      const booking = await this.service.updateBooking(id, bookingData);
      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  }

  // PUT /api/bookings/:id/cancel - Cancel a booking
  async cancelBooking(req, res) {
    try {
      const id = parseInt(req.params.id);
      const booking = await this.service.cancelBooking(id);
      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  }

  // PUT /api/bookings/:id/complete - Complete a booking
  async completeBooking(req, res) {
    try {
      const id = parseInt(req.params.id);
      const booking = await this.service.completeBooking(id);
      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  }

  // DELETE /api/bookings/:id - Delete a booking
  async deleteBooking(req, res) {
    try {
      const id = parseInt(req.params.id);
      await this.service.deleteBooking(id);
      res.json({
        success: true,
        message: 'Réservation supprimée avec succès'
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
  }
}

module.exports = BookingController;