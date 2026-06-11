const express = require("express");
const RentalController = require("./controller/rental-controller");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5413;
const rentalController = new RentalController();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Rental Service API!");
});

app.get("/rentals", rentalController.getAllRentals.bind(rentalController));
app.get(
  "/rentals/active",
  rentalController.getActiveRentals.bind(rentalController),
);
app.get("/rentals/:id", rentalController.getRentalById.bind(rentalController));

app.post("/rentals", rentalController.createRental.bind(rentalController));
app.post(
  "/rentals/:id/complete",
  rentalController.completeRental.bind(rentalController),
);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Rental Service running on port ${PORT}`);
  });
}

module.exports = app;
