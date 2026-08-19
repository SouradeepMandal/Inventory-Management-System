const Store = require("../models/store");

// Add Store
const addStore = async (req, res) => {
  try {
    const newStore = new Store({
      userID: req.body.userId,
      name: req.body.name,
      category: req.body.category,
      address: req.body.address,
      city: req.body.city,
      image: req.body.image || "",
    });
    const result = await newStore.save();
    res.status(200).json(result);
  } catch (err) {
    console.error("addStore error:", err);
    res.status(500).json({ message: err.message || "Failed to add store." });
  }
};

// Get All Stores
const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find({ userID: req.params.userID }).sort({ _id: -1 });
    res.json(stores);
  } catch (err) {
    console.error("getAllStores error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch stores." });
  }
};

module.exports = { addStore, getAllStores };
