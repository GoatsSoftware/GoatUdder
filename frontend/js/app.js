// GoatUdder - Frontend Application

const GOAT_SERVICE_URL = "http://localhost:5412";
const RENTAL_SERVICE_URL = "http://localhost:5413";

async function loadGoats() {
  try {
    const response = await fetch(`${GOAT_SERVICE_URL}/goats/available`);
    const goats = await response.json();
    displayGoats(goats);
    populateGoatSelect(goats);
  } catch (error) {
    console.error("Erreur lors de la récupération des chèvres:", error);
  }
}

function displayGoats(goats) {
  const container = document.getElementById("goats-list");

  if (goats.length === 0) {
    container.innerHTML =
      '<p class="empty-message">Aucune chèvre disponible pour le moment.</p>';
    return;
  }

  container.innerHTML = goats
    .map(
      (goat) => `
    <div class="goat-card">
      <div class="goat-info">
        <span class="goat-name">${goat.name}</span>
        <p>${goat.description || ""}</p>
        <span class="goat-status available">Disponible (${goat.available_udders} pis)</span>
      </div>
    </div>
  `,
    )
    .join("");
}

function populateGoatSelect(goats) {
  const select = document.getElementById("goat-ids");
  select.innerHTML = goats
    .map(
      (goat) => `
    <option value="${goat.id}">${goat.name} (${goat.available_udders} pis)</option>
  `,
    )
    .join("");
}

function updatePricePreview() {
  const duration = Number.parseInt(document.getElementById("duration").value);
  const select = document.getElementById("goat-ids");
  const selectedCount = select.selectedOptions.length;
  const pricePreview = document.getElementById("price-preview");

  if (selectedCount > 0 && duration > 0) {
    const totalCost = duration * selectedCount * TARIF_PAR_JOUR_PAR_PIS;
    pricePreview.textContent = `Prix estimé : ${totalCost}€ (${duration} jour${duration > 1 ? "s" : ""} × ${selectedCount} pis × ${TARIF_PAR_JOUR_PAR_PIS}€)`;
    pricePreview.className = "visible";
  } else {
    pricePreview.textContent = "";
    pricePreview.className = "";
  }
}

function handleDurationClick(event) {
  const btn = event.target;
  if (!btn.classList.contains("duration-btn")) return;

  const days = Number.parseInt(btn.dataset.days);
  document.getElementById("duration").value = days;

  document.querySelectorAll(".duration-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  updatePricePreview();
}

function handleGoatSearch(event) {
  const query = event.target.value.toLowerCase();
  const select = document.getElementById("goat-ids");
  const options = select.querySelectorAll("option");

  options.forEach((option) => {
    const name = option.textContent.toLowerCase();
    option.style.display = name.includes(query) ? "" : "none";
  });
}

function handleStartDateChange(event) {
  const startDate = event.target.value;
  const duration = Number.parseInt(document.getElementById("duration").value);

  if (startDate && duration > 0) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + duration);
    const endDateInput = document.getElementById("end-date");
    endDateInput.value = end.toISOString().split("T")[0];
    updatePricePreview();
  }
}

async function loadActiveRentals() {
  try {
    const response = await fetch(`${RENTAL_SERVICE_URL}/rentals/active`);
    const rentals = await response.json();
    displayActiveRentals(rentals);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des locations actives:",
      error,
    );
  }
}

function displayActiveRentals(rentals) {
  const container = document.getElementById("active-rentals");

  if (rentals.length === 0) {
    container.innerHTML =
      '<p class="empty-message">Aucune location en cours.</p>';
    return;
  }

  container.innerHTML = rentals
    .map(
      (rental) => `
    <div class="rental-card">
      <strong>Location #${rental.id}</strong>
      <div class="rental-details">
        <span class="rental-label">Chèvres :</span>
        <span>${rental.goat_ids.map((id) => "#" + id).join(", ")}</span>
        <span class="rental-label">Début :</span>
        <span>${rental.start_date}</span>
        <span class="rental-label">Fin :</span>
        <span>${rental.end_date}</span>
        <span class="rental-label">Coût total :</span>
        <span>${rental.total_cost}€</span>
      </div>
    </div>
  `,
    )
    .join("");
}

async function handleRentalForm(event) {
  event.preventDefault();

  const select = document.getElementById("goat-ids");
  const goatIds = Array.from(select.selectedOptions).map((option) =>
    Number.parseInt(option.value),
  );
  const startDate = document.getElementById("start-date").value;
  const duration = Number.parseInt(document.getElementById("duration").value);
  const resultDiv = document.getElementById("rental-result");

  if (goatIds.length < 1 || goatIds.length > 4) {
    resultDiv.className = "error";
    resultDiv.textContent = "Vous devez louer entre 1 et 4 pis.";
    return;
  }

  if (!startDate) {
    resultDiv.className = "error";
    resultDiv.textContent = "Veuillez remplir la date de début.";
    return;
  }

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + duration);
  const endDate = end.toISOString().split("T")[0];

  try {
    const response = await fetch(`${RENTAL_SERVICE_URL}/rentals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goatIds, startDate, endDate }),
    });

    const data = await response.json();

    if (response.ok) {
      resultDiv.className = "success";
      resultDiv.textContent = `Location créée avec succès ! Coût total : ${data.total_cost}€`;
      loadActiveRentals();
    } else {
      resultDiv.className = "error";
      resultDiv.textContent =
        data.error || "Erreur lors de la création de la location.";
    }
  } catch {
    resultDiv.className = "error";
    resultDiv.textContent = "Erreur de connexion au service de location.";
  }
}

document
  .getElementById("rental-form")
  .addEventListener("submit", handleRentalForm);

document.querySelectorAll(".duration-btn").forEach((btn) => {
  btn.addEventListener("click", handleDurationClick);
});

document.getElementById("goat-search").addEventListener("input", handleGoatSearch);
document.getElementById("start-date").addEventListener("change", handleStartDateChange);

// Set initial active button
document.querySelector('.duration-btn[data-days="1"]').classList.add("active");

// Initial load
await loadGoats();
await loadActiveRentals();
