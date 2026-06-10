const BookingRepository = require('../data/repositories/booking_repository');
const PadRepository = require('../data/repositories/pad_repository');

// Booking Service - Business logic for bookings
class BookingService {
  constructor() {
    this.bookingRepository = new BookingRepository();
    this.padRepository = new PadRepository();
  }

  // Get all bookings
  async getAllBookings() {
    const bookings = await this.bookingRepository.findAll();
    return bookings.map(booking => this.formatBooking(booking));
  }

  // Get booking by ID
  async getBookingById(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid booking ID');
    }
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    return this.formatBooking(booking);
  }

  // Get bookings by user ID
  async getBookingsByUserId(userId) {
    if (!userId || isNaN(userId)) {
      throw new Error('Invalid user ID');
    }
    const bookings = await this.bookingRepository.findByUserId(userId);
    return bookings.map(booking => this.formatBooking(booking));
  }

  // Get bookings by pad ID
  async getBookingsByPadId(padId) {
    if (!padId || isNaN(padId)) {
      throw new Error('Invalid pad ID');
    }
    const bookings = await this.bookingRepository.findByPadId(padId);
    return bookings.map(booking => this.formatBooking(booking));
  }

  // Get active bookings
  async getActiveBookings() {
    const bookings = await this.bookingRepository.findActive();
    return bookings.map(booking => this.formatBooking(booking));
  }

  // Create a new booking
  async createBooking(bookingData) {
    this.validateBookingData(bookingData);

    // Check pad availability
    const pad = await this.padRepository.findById(bookingData.pad_id);
    if (!pad) {
      throw new Error(`Pad with ID ${bookingData.pad_id} not found`);
    }
    if (pad.status !== 'available') {
      throw new Error(`Pad "${pad.name}" is not available`);
    }

    // Calculate total price
    const days = await this.bookingRepository.calculateDays(
      bookingData.start_date,
      bookingData.end_date
    );
    const total_price = pad.price_per_day * days;

    const booking = await this.bookingRepository.create({
      ...bookingData,
      total_price
    });
    return this.formatBooking(booking);
  }

  // Update a booking
  async updateBooking(id, bookingData) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid booking ID');
    }
    const existingBooking = await this.bookingRepository.findById(id);
    if (!existingBooking) {
      throw new Error(`Booking with ID ${id} not found`);
    }

    // Cannot update completed bookings
    if (existingBooking.status === 'completed') {
      throw new Error('Cannot update a completed booking');
    }

    // If updating status to active, verify pad is available
    if (bookingData.status === 'active') {
      const pad = await this.padRepository.findById(existingBooking.pad_id);
      if (pad.status !== 'available') {
        throw new Error(`Pad "${pad.name}" is not available`);
      }
    }

    const updatedBooking = await this.bookingRepository.update(id, bookingData);
    return this.formatBooking(updatedBooking);
  }

  // Cancel a booking
  async cancelBooking(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid booking ID');
    }
    const existingBooking = await this.bookingRepository.findById(id);
    if (!existingBooking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    if (existingBooking.status === 'completed') {
      throw new Error('Cannot cancel a completed booking');
    }

    const updatedBooking = await this.bookingRepository.update(id, { status: 'cancelled' });
    return this.formatBooking(updatedBooking);
  }

  // Complete a booking
  async completeBooking(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid booking ID');
    }
    const existingBooking = await this.bookingRepository.findById(id);
    if (!existingBooking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    if (existingBooking.status !== 'active') {
      throw new Error('Only active bookings can be completed');
    }

    const updatedBooking = await this.bookingRepository.update(id, { status: 'completed' });
    return this.formatBooking(updatedBooking);
  }

  // Validate booking data
  validateBookingData(bookingData) {
    if (!bookingData.pad_id || isNaN(bookingData.pad_id)) {
      throw new Error('Valid pad_id is required');
    }
    if (!bookingData.user_id || isNaN(bookingData.user_id)) {
      throw new Error('Valid user_id is required');
    }
    if (!bookingData.start_date) {
      throw new Error('start_date is required');
    }
    if (!bookingData.end_date) {
      throw new Error('end_date is required');
    }

    // Validate dates
    const start = new Date(bookingData.start_date);
    const end = new Date(bookingData.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }
    if (end <= start) {
      throw new Error('end_date must be after start_date');
    }
  }

  // Delete a booking
  async deleteBooking(id) {
    if (!id || isNaN(id)) {
      throw new Error('Invalid booking ID');
    }
    const existingBooking = await this.bookingRepository.findById(id);
    if (!existingBooking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    await this.bookingRepository.delete(id);
    return true;
  }

  // Format booking data for response
  formatBooking(booking) {
    return {
      id: booking.id,
      pad_id: booking.pad_id,
      pad_name: booking.pad_name,
      pad_location: booking.pad_location,
      user_id: booking.user_id,
      user_name: booking.user_name,
      start_date: booking.start_date,
      end_date: booking.end_date,
      total_price: parseFloat(booking.total_price),
      status: booking.status,
      created_at: booking.created_at
    };
  }
}

module.exports = BookingService;