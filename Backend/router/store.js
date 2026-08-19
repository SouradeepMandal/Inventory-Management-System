const express = require("express");
const app = express();
const store = require("../controller/store");

// Add Store 
app.post("/add", store.addStore);

// Get All Store
app.get("/get/:userID", store.getAllStores)

// Delete Store
app.delete("/delete/:id", store.deleteStore);

module.exports = app;
