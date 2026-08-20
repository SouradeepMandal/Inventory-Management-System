const express = require("express");
const app = express();
const store = require("../controller/store");
const { verifyToken } = require("../middleware/auth");

// Add Store 
app.post("/add", verifyToken, store.addStore);

// Get All Store
app.get("/get/:userID", verifyToken, store.getAllStores)

// Delete Store
app.delete("/delete/:id", verifyToken, store.deleteStore);

module.exports = app;
