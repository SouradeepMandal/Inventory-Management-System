const Purchase = require("../models/purchase");
const purchaseStock = require("./purchaseStock");

// Add Purchase Details
const addPurchase = async (req, res) => {
  try {
    const newPurchase = new Purchase({
      userID: req.body.userID,
      ProductID: req.body.productID,
      QuantityPurchased: req.body.quantityPurchased,
      PurchaseDate: req.body.purchaseDate,
      TotalPurchaseAmount: req.body.totalPurchaseAmount,
    });
    const result = await newPurchase.save();
    await purchaseStock(req.body.productID, req.body.quantityPurchased);
    res.status(200).json(result);
  } catch (err) {
    console.error("addPurchase error:", err);
    res.status(500).json({ message: err.message || "Failed to add purchase." });
  }
};

// Get All Purchase Data
const getPurchaseData = async (req, res) => {
  try {
    const purchaseData = await Purchase.find({ userID: req.params.userID })
      .sort({ _id: -1 })
      .populate("ProductID");
    res.json(purchaseData);
  } catch (err) {
    console.error("getPurchaseData error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch purchases." });
  }
};

// Get total purchase amount
const getTotalPurchaseAmount = async (req, res) => {
  try {
    let totalPurchaseAmount = 0;
    const purchaseData = await Purchase.find({ userID: req.params.userID });
    purchaseData.forEach((purchase) => {
      totalPurchaseAmount += purchase.TotalPurchaseAmount;
    });
    res.json({ totalPurchaseAmount });
  } catch (err) {
    console.error("getTotalPurchaseAmount error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch total purchases." });
  }
};

module.exports = { addPurchase, getPurchaseData, getTotalPurchaseAmount };
