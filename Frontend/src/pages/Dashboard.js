import React, { useContext, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import AuthContext from "../AuthContext";
import AIInsights from "../components/AIInsights";
import API_BASE_URL from "../config";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: ["Apple", "Knorr", "Shoop", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "# of Votes",
      data: [0, 1, 5, 8, 9, 15],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

function Dashboard() {
  const [saleAmount, setSaleAmount] = useState(0);
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  const [chart, setChart] = useState({
    options: {
      chart: {
        id: "basic-bar",
        toolbar: { show: false },
      },
      xaxis: {
        categories: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ],
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: { height: 250 },
            xaxis: {
              labels: { style: { fontSize: "10px" } },
            },
          },
        },
      ],
    },
    series: [
      {
        name: "Monthly Sales Amount",
        data: [10, 20, 40, 50, 60, 20, 10, 35, 45, 70, 25, 70],
      },
    ],
  });

  const authContext = useContext(AuthContext);
  const userId = authContext.user?._id || authContext.user;

  const updateChartData = (salesData) => {
    if (Array.isArray(salesData)) {
      setChart((prev) => ({
        ...prev,
        series: [
          {
            name: "Monthly Sales Amount",
            data: [...salesData],
          },
        ],
      }));
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTotalSaleAmount();
      fetchTotalPurchaseAmount();
      fetchStoresData();
      fetchProductsData();
      fetchMonthlySalesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchTotalSaleAmount = () => {
    fetch(`${API_BASE_URL}/api/sales/get/${userId}/totalsaleamount`)
      .then((response) => response.json())
      .then((datas) => setSaleAmount(datas.totalSaleAmount || 0))
      .catch((err) => console.log(err));
  };

  const fetchTotalPurchaseAmount = () => {
    fetch(`${API_BASE_URL}/api/purchase/get/${userId}/totalpurchaseamount`)
      .then((response) => response.json())
      .then((datas) => setPurchaseAmount(datas.totalPurchaseAmount || 0))
      .catch((err) => console.log(err));
  };

  const fetchStoresData = () => {
    fetch(`${API_BASE_URL}/api/store/get/${userId}`)
      .then((response) => response.json())
      .then((datas) => setStores(Array.isArray(datas) ? datas : []))
      .catch((err) => console.log(err));
  };

  const fetchProductsData = () => {
    fetch(`${API_BASE_URL}/api/product/get/${userId}`)
      .then((response) => response.json())
      .then((datas) => setProducts(Array.isArray(datas) ? datas : []))
      .catch((err) => console.log(err));
  };

  const fetchMonthlySalesData = () => {
    fetch(`${API_BASE_URL}/api/sales/getmonthly/${userId}`)
      .then((response) => response.json())
      .then((datas) => updateChartData(datas.salesAmount))
      .catch((err) => console.log(err));
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-x-hidden">
      {/* AI Smart Insights Section */}
      <AIInsights />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {/* Total Sales */}
        <article className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="inline-flex gap-2 self-end rounded bg-green-100 p-1 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-medium"> +12.5% </span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">Total Sales</strong>
            <p className="mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">${saleAmount}</span>
            </p>
          </div>
        </article>

        {/* Total Purchases */}
        <article className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="inline-flex gap-2 self-end rounded bg-red-100 p-1 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
            <span className="text-xs font-medium"> Purchase </span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">Total Purchases</strong>
            <p className="mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">${purchaseAmount}</span>
            </p>
          </div>
        </article>

        {/* Total Products */}
        <article className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="inline-flex gap-2 self-end rounded bg-indigo-100 p-1 text-indigo-600">
            <span className="text-xs font-medium"> Items </span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">Total Products</strong>
            <p className="mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{products.length}</span>
            </p>
          </div>
        </article>

        {/* Total Stores */}
        <article className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="inline-flex gap-2 self-end rounded bg-purple-100 p-1 text-purple-600">
            <span className="text-xs font-medium"> Branches </span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">Total Stores</strong>
            <p className="mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{stores.length}</span>
            </p>
          </div>
        </article>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Monthly Sales Overview</h3>
          <div className="w-full overflow-hidden">
            <Chart options={chart.options} series={chart.series} type="bar" width="100%" height={300} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Product Stock Distribution</h3>
          <div className="flex justify-center items-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
              <Doughnut data={data} options={{ maintainAspectRatio: true, responsive: true }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
