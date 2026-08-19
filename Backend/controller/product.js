const Product = require("../models/product");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");

// Add Product
const addProduct = async (req, res) => {
  try {
    const newProduct = new Product({
      userID: req.body.userId,
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      stock: 0,
      description: req.body.description,
    });
    const result = await newProduct.save();
    res.status(200).json(result);
  } catch (err) {
    console.error("addProduct error:", err);
    res.status(500).json({ message: err.message || "Failed to add product." });
  }
};

// Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ userID: req.params.userId }).sort({ _id: -1 });
    res.json(products);
  } catch (err) {
    console.error("getAllProducts error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch products." });
  }
};

// Delete Selected Product
const deleteSelectedProduct = async (req, res) => {
  try {
    const deleteProduct = await Product.deleteOne({ _id: req.params.id });
    const deletePurchaseProduct = await Purchase.deleteMany({ ProductID: req.params.id });
    const deleteSaleProduct = await Sales.deleteMany({ ProductID: req.params.id });
    res.json({ deleteProduct, deletePurchaseProduct, deleteSaleProduct });
  } catch (err) {
    console.error("deleteSelectedProduct error:", err);
    res.status(500).json({ message: err.message || "Failed to delete product." });
  }
};

// Update Selected Product
const updateSelectedProduct = async (req, res) => {
  try {
    const updatedResult = await Product.findByIdAndUpdate(
      { _id: req.body.productID },
      {
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
      },
      { new: true }
    );
    if (!updatedResult) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(updatedResult);
  } catch (err) {
    console.error("updateSelectedProduct error:", err);
    res.status(500).json({ message: err.message || "Failed to update product." });
  }
};

// Search Products
const searchProduct = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm;
    const userId = req.query.userId;
    const products = await Product.find({
      userID: userId,
      name: { $regex: searchTerm, $options: "i" },
    });
    res.json(products);
  } catch (err) {
    console.error("searchProduct error:", err);
    res.status(500).json({ message: err.message || "Failed to search products." });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
};
