// GoatUdder Frontend Application
// API endpoints
const API_BASE_URL = 'http://localhost:8000/api';
const BOOKING_API_BASE_URL = 'http://localhost:8001/api';

// State
let currentUser = null;
let selectedPad = null;

// DOM Elements
const padsList = document.getElementById('padsList');
const padsLoading = document.getElementById('padsLoading');
const bookingsList = document.getElementById('bookingsList');
const bookingsLoading = document.getElementById('bookingsLoading');
const bookingModal = document.getElementById('bookingModal');
const userModal = document.getElementById('userModal');
const bookingForm = document.getElementById('bookingForm');
const userForm = document.getElementById('userForm');
const browsePadsBtn = document.getElementById('browsePadsBtn');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadPads();
    setupEventListeners();
});

// Load available pads from API
async function loadPads() {
    try {
        padsLoading.style.display = 'block';
        padsList.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/pads/available`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pads = await response.json();

        padsLoading.style.display = 'none';
        padsList.style.display = 'grid';

        if (pads.length === 0) {
            padsList.innerHTML = '<p class="loading">Aucun pad disponible pour le moment.</p>';
            return;
        }

        padsList.innerHTML = pads.map(pad => `
            <div class="pad-card">
                <h3>${pad.name}</h3>
                <p class="location">📍 ${pad.location}</p>
                <div class="details">
                    <p><strong>Superficie:</strong> ${pad.area} hectares</p>
                    <p><strong>Type:</strong> ${pad.type}</p>
                    <p><strong>Capacité:</strong> ${pad.capacity} chèvres</p>
                    <p><strong>Équipements:</strong> ${pad.equipments}</p>
                </div>
                <p class="price">${pad.price_per_day}€/jour</p>
                <span class="status available">Disponible</span>
                <button class="book-btn" onclick="openBookingModal(${pad.id}, '${pad.name}', ${pad.price_per_day})">Réserver</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading pads:', error);
        padsLoading.style.display = 'block';
        padsLoading.innerHTML = '<p style="color: #c62828;">Erreur lors du chargement des pads. Vérifiez que l\'API est démarrée.</p>';
    }
}

// Load user bookings
async function loadBookings() {
    if (!currentUser) {
        bookingsList.innerHTML = '<p class="loading">Veuillez vous connecter pour voir vos réservations.</p>';
        return;
    }

    try {
        bookingsLoading.style.display = 'block';
        bookingsList.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/bookings/user/${currentUser.id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bookings = await response.json();

        bookingsLoading.style.display = 'none';
        bookingsList.style.display = 'flex';

        if (bookings.length === 0) {
            bookingsList.innerHTML = '<p class="loading">Aucune réservation pour le moment.</p>';
            return;
        }

        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-card">
                <h3>Pad: ${booking.pad_name}</h3>
                <div class="info">
                    <span><strong>Début:</strong> ${booking.start_date}</span>
                    <span><strong>Fin:</strong> ${booking.end_date}</span>
                    <span><strong>Prix:</strong> ${booking.total_price}€</span>
                </div>
                <span class="status ${booking.status}">${formatBookingStatus(booking.status)}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsLoading.style.display = 'block';
        bookingsLoading.innerHTML = '<p style="color: #c62828;">Erreur lors du chargement des réservations.</p>';
    }
}

// Format booking status
function formatBookingStatus(status) {
    const statusMap = {
        'active': 'Active',
        'completed': 'Complétée',
        'cancelled': 'Annulée',
        'pending': 'En attente'
    };
    return statusMap[status] || status;
}

// Open booking modal
function openBookingModal(padId, padName, pricePerDay) {
    selectedPad = { id: padId, name: padName, pricePerDay: pricePerDay };

    document.getElementById('padName').value = padName;
    document.getElementById('totalPrice').value = `${pricePerDay}€`;

    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;

    bookingModal.classList.add('active');
}

// Close booking modal
function closeBookingModal() {
    bookingModal.classList.remove('active');
    bookingForm.reset();
    selectedPad = null;
}

// Open user registration modal
function openUserModal() {
    userModal.classList.add('active');
}

// Close user modal
function closeUserModal() {
    userModal.classList.remove('active');
    userForm.reset();
}

// Register user
async function registerUser(name, email, phone) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const user = await response.json();
        currentUser = user;
        closeUserModal();
        loadBookings();
        return user;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

// Create booking
async function createBooking(padId, startDate, endDate, paymentMethod) {
    try {
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalPrice = days * selectedPad.pricePerDay;

        const bookingData = {
            user_id: currentUser.id,
            pad_id: padId,
            start_date: startDate,
            end_date: endDate,
            total_price: totalPrice
        };

        // Create booking via API
        const bookingResponse = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (!bookingResponse.ok) {
            throw new Error(`HTTP error! status: ${bookingResponse.status}`);
        }

        const booking = await bookingResponse.json();

        // Process payment via Booking Service
        const paymentResponse = await fetch(`${BOOKING_API_BASE_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                booking_id: booking.id,
                amount: totalPrice,
                payment_method: paymentMethod
            })
        });

        if (!paymentResponse.ok) {
            throw new Error(`HTTP error! status: ${paymentResponse.status}`);
        }

        const payment = await paymentResponse.json();

        // Send booking confirmation notification
        await fetch(`${BOOKING_API_BASE_URL}/notifications/booking-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                booking_id: booking.id,
                user_email: currentUser.email,
                pad_name: selectedPad.name,
                start_date: startDate,
                end_date: endDate,
                total_price: totalPrice
            })
        });

        closeBookingModal();
        loadBookings();
        return { booking, payment };
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Browse pads button
    browsePadsBtn.addEventListener('click', () => {
        document.getElementById('pads').scrollIntoView({ behavior: 'smooth' });
    });

    // Booking modal close button
    bookingModal.querySelector('.close-btn').addEventListener('click', closeBookingModal);

    // User modal close button
    userModal.querySelector('.close-btn').addEventListener('click', closeUserModal);

    // Close modals on outside click
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) closeBookingModal();
    });

    userModal.addEventListener('click', (e) => {
        if (e.target === userModal) closeUserModal();
    });

    // Booking form submit
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentUser) {
            openUserModal();
            return;
        }

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const paymentMethod = document.getElementById('paymentMethod').value;

        if (!startDate || !endDate) {
            alert('Veuillez remplir toutes les dates.');
            return;
        }

        if (new Date(endDate) <= new Date(startDate)) {
            alert('La date de fin doit être après la date de début.');
            return;
        }

        try {
            const result = await createBooking(selectedPad.id, startDate, endDate, paymentMethod);
            alert(`Réservation confirmée! ID: ${result.booking.id}\nPaiement ID: ${result.payment.id}`);
        } catch (error) {
            alert('Erreur lors de la création de la réservation.');
        }
    });

    // User form submit
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;
        const phone = document.getElementById('userPhone').value;

        try {
            await registerUser(name, email, phone);
            alert('Compte créé avec succès!');
        } catch (error) {
            alert('Erreur lors de la création du compte.');
        }
    });

    // Auto-load bookings if user exists
    loadBookings();
}