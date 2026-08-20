const express = require("express");
const app = express();
const purchase = require("../controller/purchase");
const { verifyToken } = require("../middleware/auth");

// Add Purchase
app.post("/add", verifyToken, purchase.addPurchase);

// Get All Purchase Data
app.get("/get/:userID", verifyToken, purchase.getPurchaseData);

app.get("/get/:userID/totalpurchaseamount", verifyToken, purchase.getTotalPurchaseAmount);

module.exports = app;

// http://localhost:4000/api/purchase/add POST
// http://localhost:4000/api/purchase/get GET
