const express = require("express");
const app = express();
const sales = require("../controller/sales");
const { verifyToken } = require("../middleware/auth");

// Add Sales
app.post("/add", verifyToken, sales.addSales);

// Get All Sales
app.get("/get/:userID", verifyToken, sales.getSalesData);
app.get("/getmonthly/:userID", verifyToken, sales.getMonthlySales);


app.get("/get/:userID/totalsaleamount", verifyToken, sales.getTotalSalesAmount);

module.exports = app;



// http://localhost:4000/api/sales/add POST
// http://localhost:4000/api/sales/get GET
