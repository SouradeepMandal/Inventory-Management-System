const express = require("express");
const app = express();
const product = require("../controller/product");
const { verifyToken } = require("../middleware/auth");

// Add Product
app.post("/add", verifyToken, product.addProduct);

// Get All Products
app.get("/get/:userId", verifyToken, product.getAllProducts);

// Delete Selected Product Item
app.get("/delete/:id", verifyToken, product.deleteSelectedProduct);

// Update Selected Product
app.post("/update", verifyToken, product.updateSelectedProduct);

// Search Product
app.get("/search", verifyToken, product.searchProduct);

// http://localhost:4000/api/product/search?searchTerm=fa

module.exports = app;
