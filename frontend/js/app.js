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
    parseInt(option.value),
  );
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;
  const resultDiv = document.getElementById("rental-result");

  if (goatIds.length < 1 || goatIds.length > 4) {
    resultDiv.className = "error";
    resultDiv.textContent = "Vous devez louer entre 1 et 4 pis.";
    return;
  }

  if (!startDate || !endDate) {
    resultDiv.className = "error";
    resultDiv.textContent = "Veuillez remplir les dates de début et de fin.";
    return;
  }

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
  } catch (error) {
    resultDiv.className = "error";
    resultDiv.textContent = "Erreur de connexion au service de location.";
  }
}

document
  .getElementById("rental-form")
  .addEventListener("submit", handleRentalForm);

// Initial load
loadGoats();
loadActiveRentals();
