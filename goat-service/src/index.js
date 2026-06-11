const express = require("express");
const GoatController = require("./controller/goat-controller");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5412;
const goatController = new GoatController();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Goat Service API!");
});

app.get("/goats", goatController.getAllGoats.bind(goatController));
app.get(
  "/goats/available",
  (req, res, next) => {
    console.log("AVAILABLE ROUTE HIT");
    next();
  },
  goatController.getAvailableGoats.bind(goatController),
);
app.get("/goats/:id", goatController.getGoatById.bind(goatController));
app.get(
  "/goats/:id/available",
  (req, res, next) => {
    console.log("GOAT AVAILABILITY CHECK HIT");
    next();
  },
  goatController.isGoatAvailable.bind(goatController),
);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Rental Service running on port ${PORT}`);
  });
}

module.exports = app;
