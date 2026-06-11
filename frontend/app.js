// GoatUdder Frontend Application
// API endpoints - works both locally and via Docker nginx proxy
const API_BASE_URL = "http://127.0.0.1:8000/api";
const BOOKING_API_BASE_URL = "http://127.0.0.1:8001/booking-api";

// State
let currentUser = null;
let selectedUdder = null;

// DOM Elements
const uddersList = document.getElementById("uddersList");
const uddersLoading = document.getElementById("uddersLoading");
const bookingsList = document.getElementById("bookingsList");
const bookingsLoading = document.getElementById("bookingsLoading");
const bookingModal = document.getElementById("bookingModal");
const userModal = document.getElementById("userModal");
const loginModal = document.getElementById("loginModal");
const bookingForm = document.getElementById("bookingForm");
const userForm = document.getElementById("userForm");
const loginForm = document.getElementById("loginForm");
const browseUddersBtn = document.getElementById("browseUddersBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userDisplay = document.getElementById("userDisplay");

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loadUdders();
  setupEventListeners();
});

// Check authentication status
function checkAuth() {
  const token = localStorage.getItem("goatUdderToken");
  const user = localStorage.getItem("goatUdderUser");

  if (token && user) {
    currentUser = JSON.parse(user);
    showAuthUI();
  } else {
    hideAuthUI();
  }
}

// Show authenticated UI
function showAuthUI() {
  loginBtn.style.display = "none";
  logoutBtn.style.display = "inline-block";
  userDisplay.style.display = "inline-block";
  userDisplay.textContent = `👤 ${currentUser.username}`;
}

// Hide authenticated UI
function hideAuthUI() {
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
  userDisplay.style.display = "none";
  currentUser = null;
}

// Get auth token for API requests
function getAuthToken() {
  const token = localStorage.getItem("goatUdderToken");
  if (!token) {
    throw new Error('Non authentifié');
  }
  return token;
}

// Load available udders from API
async function loadUdders() {
  try {
    uddersLoading.style.display = "block";
    uddersList.style.display = "none";

    const headers = {};
    const token = localStorage.getItem("goatUdderToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/udder/available`, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseData = await response.json();
    const udders = responseData.data;

    uddersLoading.style.display = "none";
    uddersList.style.display = "grid";

    if (!udders || udders.length === 0) {
      uddersList.innerHTML =
        '<p class="loading">Aucun pis disponible pour le moment.</p>';
      return;
    }

    uddersList.innerHTML = udders
      .map(
        (udder) => `
            <div class="udder-card">
                <h3>${udder.name}</h3>
                <p class="location">📍 ${udder.location}</p>
                <div class="details">
                    <p><strong>Capacité:</strong> ${udder.capacity} chèvres</p>
                    <p><strong>Équipements:</strong> ${udder.amenities ? udder.amenities.join(', ') : 'N/A'}</p>
                </div>
                <p class="price">${udder.price_per_day}€/jour</p>
                <span class="status available">Disponible</span>
                <button class="book-btn" onclick="openBookingModal(${udder.id}, '${udder.name}', ${udder.price_per_day})">Réserver</button>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading udders:", error);
    uddersLoading.style.display = "block";
    uddersLoading.innerHTML =
      '<p style="color: #c62828;">Erreur lors du chargement des pis. Vérifiez que l\'API est démarrée.</p>';
  }
}

// Load user bookings
async function loadBookings() {
  if (!currentUser) {
    bookingsLoading.style.display = "none";
    bookingsList.style.display = "block";
    bookingsList.innerHTML =
      '<p class="loading">Veuillez vous connecter pour voir vos réservations.</p>';
    return;
  }

  try {
    bookingsLoading.style.display = "block";
    bookingsList.style.display = "none";

    const token = getAuthToken();
    const response = await fetch(
      `${API_BASE_URL}/bookings/user/${currentUser.id}`,
      { headers: { "Authorization": `Bearer ${token}` } },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const bookingResponseData = await response.json();
    const bookings = bookingResponseData.data;

    bookingsLoading.style.display = "none";
    bookingsList.style.display = "flex";

    if (!bookings || bookings.length === 0) {
      bookingsList.innerHTML =
        '<p class="loading">Aucune réservation pour le moment.</p>';
      return;
    }

    bookingsList.innerHTML = bookings
      .map(
        (booking) => `
            <div class="booking-card">
                <h3>Pis: ${booking.udder_name || booking.pad_name}</h3>
                <div class="info">
                    <span><strong>Début:</strong> ${booking.start_date}</span>
                    <span><strong>Fin:</strong> ${booking.end_date}</span>
                    <span><strong>Prix:</strong> ${booking.total_price}€</span>
                </div>
                <span class="status ${booking.status}">${formatBookingStatus(booking.status)}</span>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error loading bookings:", error);
    bookingsLoading.style.display = "block";
    bookingsLoading.innerHTML =
      '<p style="color: #c62828;">Erreur lors du chargement des réservations.</p>';
  }
}

// Format booking status
function formatBookingStatus(status) {
  const statusMap = {
    active: "Active",
    completed: "Complétée",
    cancelled: "Annulée",
    pending: "En attente",
  };
  return statusMap[status] || status;
}

// Open booking modal
function openBookingModal(udderId, udderName, pricePerDay) {
  selectedUdder = { id: udderId, name: udderName, pricePerDay: pricePerDay };

  document.getElementById("udderName").value = udderName;
  document.getElementById("totalPrice").value = `${pricePerDay}€`;

  // Set minimum dates
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("startDate").min = today;
  document.getElementById("endDate").min = today;

  bookingModal.classList.add("active");
}

// Close booking modal
function closeBookingModal() {
  bookingModal.classList.remove("active");
  bookingForm.reset();
  selectedUdder = null;
}

// Open user registration modal
function openUserModal() {
  userModal.classList.add("active");
}

// Close user modal
function closeUserModal() {
  userModal.classList.remove("active");
  userForm.reset();
}

// Open login modal
function openLoginModal() {
  loginModal.classList.add("active");
}

// Close login modal
function closeLoginModal() {
  loginModal.classList.remove("active");
  loginForm.reset();
}

// Login user
async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const loginResponseData = await response.json();
    const { user, token } = loginResponseData.data;

    // Store token and user in localStorage
    localStorage.setItem("goatUdderToken", token);
    localStorage.setItem("goatUdderUser", JSON.stringify(user));

    currentUser = user;
    showAuthUI();
    closeLoginModal();
    loadBookings();
    return user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

// Logout user
function logout() {
  localStorage.removeItem("goatUdderToken");
  localStorage.removeItem("goatUdderUser");
  hideAuthUI();
  loadBookings();
}

// Register user
async function registerUser(username, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const userResponseData = await response.json();
    const user = userResponseData.data;
    currentUser = user;
    closeUserModal();
    loadBookings();
    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

// Create booking
async function createBooking(udderId, startDate, endDate, paymentMethod) {
  try {
    const days = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = days * selectedUdder.pricePerDay;

    const token = getAuthToken();

    const bookingData = {
      user_id: currentUser.id,
      udder_id: udderId,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
    };

    // Create booking via API
    const bookingResponse = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
    });

    if (!bookingResponse.ok) {
      throw new Error(`HTTP error! status: ${bookingResponse.status}`);
    }

    const bookingResponseData = await bookingResponse.json();
    const booking = bookingResponseData.data;

    // Process payment via Booking Service
    const paymentResponse = await fetch(`${BOOKING_API_BASE_URL}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_id: booking.id,
        amount: totalPrice,
        payment_method: paymentMethod,
      }),
    });

    if (!paymentResponse.ok) {
      throw new Error(`HTTP error! status: ${paymentResponse.status}`);
    }

    const paymentResponseData = await paymentResponse.json();
    const payment = paymentResponseData.data;

    // Send booking confirmation notification
    await fetch(`${BOOKING_API_BASE_URL}/notifications/booking-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: currentUser.id,
        booking_id: booking.id,
        user_email: currentUser.email,
        udder_name: selectedUdder.name,
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice,
      }),
    });

    closeBookingModal();
    loadBookings();
    return { booking, payment };
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Browse udders button
  browseUddersBtn.addEventListener("click", () => {
    document.getElementById("udders").scrollIntoView({ behavior: "smooth" });
  });

  // Login button
  loginBtn.addEventListener("click", openLoginModal);

  // Logout button
  logoutBtn.addEventListener("click", logout);

  // Booking modal close button
  bookingModal
    .querySelector(".close-btn")
    .addEventListener("click", closeBookingModal);

  // User modal close button
  userModal
    .querySelector(".close-btn")
    .addEventListener("click", closeUserModal);

  // Login modal close button
  loginModal
    .querySelector(".close-btn")
    .addEventListener("click", closeLoginModal);

  // Close modals on outside click
  bookingModal.addEventListener("click", (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });

  userModal.addEventListener("click", (e) => {
    if (e.target === userModal) closeUserModal();
  });

  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) closeLoginModal();
  });

  // Booking form submit
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) {
      openLoginModal();
      return;
    }

    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const paymentMethod = document.getElementById("paymentMethod").value;

    if (!startDate || !endDate) {
      alert("Veuillez remplir toutes les dates.");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      alert("La date de fin doit être après la date de début.");
      return;
    }

    try {
      const result = await createBooking(
        selectedUdder.id,
        startDate,
        endDate,
        paymentMethod,
      );
      alert(
        `Réservation confirmée! ID: ${result.booking.id}\nPaiement ID: ${result.payment.id}`,
      );
    } catch (error) {
      alert("Erreur lors de la création de la réservation.");
    }
  });

  // User form submit
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;
    const password = document.getElementById("userPassword").value;

    try {
      await registerUser(username, email, password);
      alert("Compte créé avec succès!");
    } catch (error) {
      alert("Erreur lors de la création du compte.");
    }
  });

  // Login form submit
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await login(username, password);
      alert("Connexion réussie!");
    } catch (error) {
      alert("Erreur lors de la connexion: " + error.message);
    }
  });

  // Auto-load bookings if user exists
  if (currentUser) {
    loadBookings();
  }
}