import React, { useState, useEffect, useContext } from "react";
import AddSale from "../components/AddSale";
import AuthContext from "../AuthContext";
import API_BASE_URL from "../config";

function Sales() {
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [sales, setAllSalesData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [stores, setAllStores] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchSalesData();
    fetchProductsData();
    fetchStoresData();
  }, [updatePage]);

  // Fetching Data of All Sales
  const fetchSalesData = () => {
    fetch(`${API_BASE_URL}/api/sales/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllSalesData(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching Data of All Products
  const fetchProductsData = () => {
    fetch(`${API_BASE_URL}/api/product/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching Data of All Stores
  const fetchStoresData = () => {
    fetch(`${API_BASE_URL}/api/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllStores(data);
      });
  };

  // Modal for Sale Add
  const addSaleModalSetting = () => {
    setShowSaleModal(!showSaleModal);
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  return (
    <div className="w-full p-4 sm:p-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-5">
        {showSaleModal && (
          <AddSale
            addSaleModalSetting={addSaleModalSetting}
            products={products}
            stores={stores}
            handlePageUpdate={handlePageUpdate}
            authContext={authContext}
          />
        )}
        {/* Table */}
        <div className="rounded-xl border bg-white border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-5 pb-3 px-4">
            <div className="flex gap-4 items-center">
              <span className="font-bold text-gray-800">Sales</span>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 text-sm rounded-lg transition-colors duration-150"
                onClick={addSaleModalSetting}
              >
                Add Sales
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                    Product Name
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                    Store Name
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                    Stock Sold
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                    Sales Date
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                    Total Sale Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {sales.map((element, index) => {
                  return (
                    <tr key={element._id} className="hover:bg-gray-50 transition-colors duration-100">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                        {element.ProductID?.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {element.StoreID?.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {element.StockSold}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {element.SaleDate}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-800">
                        ${element.TotalSaleAmount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sales;
