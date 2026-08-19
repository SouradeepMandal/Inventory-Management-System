const Sales = require("../models/sales");
const soldStock = require("../controller/soldStock");

// Add Sales
const addSales = async (req, res) => {
  try {
    const newSale = new Sales({
      userID: req.body.userID,
      ProductID: req.body.productID,
      StoreID: req.body.storeID,
      StockSold: req.body.stockSold,
      SaleDate: req.body.saleDate,
      TotalSaleAmount: req.body.totalSaleAmount,
    });
    const result = await newSale.save();
    await soldStock(req.body.productID, req.body.stockSold);
    res.status(200).json(result);
  } catch (err) {
    console.error("addSales error:", err);
    res.status(500).json({ message: err.message || "Failed to add sale." });
  }
};

// Get All Sales Data
const getSalesData = async (req, res) => {
  try {
    const salesData = await Sales.find({ userID: req.params.userID })
      .sort({ _id: -1 })
      .populate("ProductID")
      .populate("StoreID");
    res.json(salesData);
  } catch (err) {
    console.error("getSalesData error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch sales." });
  }
};

// Get total sales amount
const getTotalSalesAmount = async (req, res) => {
  try {
    let totalSaleAmount = 0;
    const salesData = await Sales.find({ userID: req.params.userID });
    salesData.forEach((sale) => {
      totalSaleAmount += sale.TotalSaleAmount;
    });
    res.json({ totalSaleAmount });
  } catch (err) {
    console.error("getTotalSalesAmount error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch total sales." });
  }
};

const getMonthlySales = async (req, res) => {
  try {
    const sales = await Sales.find({ userID: req.params.userID });

    const salesAmount = new Array(12).fill(0);

    sales.forEach((sale) => {
      if (sale.SaleDate) {
        const monthIndex = parseInt(sale.SaleDate.split("-")[1]) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          salesAmount[monthIndex] += sale.TotalSaleAmount;
        }
      }
    });

    res.status(200).json({ salesAmount });
  } catch (err) {
    console.error("getMonthlySales error:", err);
    res.status(500).json({ message: err.message || "Server error fetching monthly sales." });
  }
};

module.exports = { addSales, getMonthlySales, getSalesData, getTotalSalesAmount };
