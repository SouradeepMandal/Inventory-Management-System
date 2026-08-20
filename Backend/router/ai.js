const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Sales = require("../models/sales");
const Purchase = require("../models/purchase");
const { verifyToken } = require("../middleware/auth");
const { GoogleGenAI } = require("@google/genai");

router.post("/insights", verifyToken, async (req, res) => {
  try {
    // 1. Fetch current inventory & sales metrics from MongoDB
    const products = await Product.find({});
    const sales = await Sales.find({});
    const purchases = await Purchase.find({});

    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => (p.stock || p.quantity || 0) < 10);
    const outOfStockProducts = products.filter(p => (p.stock || p.quantity || 0) === 0);
    const totalSalesValue = sales.reduce((acc, s) => acc + (Number(s.TotalAmount || s.totalAmount || 0)), 0);
    const totalPurchaseCost = purchases.reduce((acc, p) => acc + (Number(p.TotalPurchaseAmount || p.totalAmount || 0)), 0);

    const inventoryDataSummary = {
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockItemNames: lowStockProducts.map(p => p.name || p.title),
      totalSalesRevenue: totalSalesValue,
      totalPurchaseSpend: totalPurchaseCost
    };

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. If valid Gemini API key is provided, use Google GenAI
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an expert Inventory Management AI Advisor. 
Analyze the following store inventory metrics and generate a structured summary with actionable recommendations:

Metrics:
${JSON.stringify(inventoryDataSummary, null, 2)}

Provide your response in raw JSON format with the following fields:
{
  "healthScore": <number between 1 and 100>,
  "summary": "<2-sentence executive summary>",
  "actionItems": ["<action item 1>", "<action item 2>", "<action item 3>"],
  "lowStockAlert": "<alert message regarding low stock items>"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
        });

        const textResponse = response.text || "";
        // Extract JSON if wrapped in markdown code blocks
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({ success: true, aiGenerated: true, insights: parsed });
        }
      } catch (aiErr) {
        console.log("Gemini API call failed, switching to algorithmic fallback: ", aiErr.message);
      }
    }

    // 3. Fallback Smart Rule-based Insights when API key is not configured yet
    const healthScore = Math.max(20, 100 - (lowStockProducts.length * 15) - (outOfStockProducts.length * 25));
    const fallbackInsights = {
      healthScore,
      summary: `Your inventory has ${totalProducts} total products registered. ${lowStockProducts.length} items require immediate restocking attention.`,
      actionItems: [
        lowStockProducts.length > 0 ? `Reorder low stock items: ${lowStockProducts.slice(0, 3).map(p => p.name || 'Product').join(', ')}` : "All product stock levels are currently healthy.",
        `Review purchase history (Total Spend: $${totalPurchaseCost.toFixed(2)})`,
        `Optimize high-demand sales categories (Total Revenue: $${totalSalesValue.toFixed(2)})`
      ],
      lowStockAlert: lowStockProducts.length > 0 
        ? `Warning: ${lowStockProducts.length} item(s) are below safety stock threshold (<10 units).`
        : "No low stock alerts at this time."
    };

    return res.json({ success: true, aiGenerated: false, insights: fallbackInsights });

  } catch (error) {
    console.error("AI Insights Error: ", error);
    res.status(500).json({ message: "Failed to generate AI insights", error: error.message });
  }
});

module.exports = router;
