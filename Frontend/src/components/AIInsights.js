import React, { useState, useEffect } from "react";

function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("process.env.REACT_APP_API_URL || "http://localhost:4000"/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInsights(data.insights);
        setAiGenerated(data.aiGenerated);
      } else {
        setError(data.message || "Failed to load AI insights");
      }
    } catch (err) {
      console.error("AI Insights fetch error:", err);
      setError("Unable to connect to server for AI insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md border border-indigo-100 p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              Gemini AI Smart Advisor
              {aiGenerated ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Live AI Active
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                  Smart Analytics
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500">Real-time inventory health, low stock alerts, & actionable suggestions</p>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition duration-150 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Refresh Insights"}
        </button>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center items-center text-gray-500 text-sm animate-pulse">
          ⚡ Analyzing inventory data and generating health metrics...
        </div>
      ) : error ? (
        <div className="mt-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200">
          {error}
        </div>
      ) : insights ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Score Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-5 text-white flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-200">Inventory Health Score</span>
              <div className="text-4xl font-extrabold mt-2">{insights.healthScore} <span className="text-xl font-normal text-indigo-200">/ 100</span></div>
            </div>
            <p className="text-xs mt-3 text-indigo-100 leading-relaxed">
              {insights.healthScore >= 75
                ? "Optimal Stock Levels — Low risk of stockout."
                : insights.healthScore >= 50
                ? "Moderate Attention Required — Some items approaching low stock."
                : "Critical Warning — Restock needed urgently."}
            </p>
          </div>

          {/* Executive Summary & Alerts */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-xs uppercase font-bold tracking-wider text-gray-500 mb-1">Executive Summary</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{insights.summary}</p>
            </div>

            {insights.lowStockAlert && (
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 text-sm flex items-start gap-2">
                <span className="text-amber-500 text-base font-bold">⚠️</span>
                <div>{insights.lowStockAlert}</div>
              </div>
            )}

            {insights.actionItems && insights.actionItems.length > 0 && (
              <div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">Recommended Actions</h3>
                <ul className="space-y-1.5">
                  {insights.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-center text-xs text-gray-700 gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AIInsights;
