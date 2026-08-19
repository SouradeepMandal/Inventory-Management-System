import React, { useState, useEffect, useContext } from "react";
import AddProduct from "../components/AddProduct";
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";
import API_BASE_URL from "../config";

function Inventory() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProduct, setUpdateProduct] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState();
  const [updatePage, setUpdatePage] = useState(true);
  const [stores, setAllStores] = useState([]);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchProductsData();
    fetchSalesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePage]);

  // Fetching Data of All Products
  const fetchProductsData = () => {
    fetch(`${API_BASE_URL}/api/product/get/${authContext.user?._id || authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching Data of Search Products
  const fetchSearchData = () => {
    fetch(`${API_BASE_URL}/api/product/search?searchTerm=${searchTerm}&userId=${authContext.user?._id || authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching all stores data
  const fetchSalesData = () => {
    fetch(`${API_BASE_URL}/api/store/get/${authContext.user?._id || authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllStores(data);
      });
  };

  // Modal for Product ADD
  const addProductModalSetting = () => {
    setShowProductModal(!showProductModal);
  };

  // Modal for Product UPDATE
  const updateProductModalSetting = (selectedProductData) => {
    setUpdateProduct(selectedProductData);
    setShowUpdateModal(!showUpdateModal);
  };

  // Delete item
  const deleteItem = (id) => {
    fetch(`${API_BASE_URL}/api/product/delete/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setUpdatePage(!updatePage);
      });
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  // Handle Search Term
  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
    fetchSearchData();
  };

  return (
    <div className="w-full p-4 sm:p-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-5">
        {/* Overview Summary Cards */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 shadow-sm">
          <span className="font-semibold text-gray-800 text-base">Overall Inventory</span>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="flex flex-col p-3 sm:p-4 rounded-lg bg-blue-50">
              <span className="font-semibold text-blue-600 text-sm">
                Total Products
              </span>
              <span className="font-bold text-gray-800 text-lg mt-1">
                {products.length}
              </span>
              <span className="text-gray-400 text-xs mt-0.5">
                Last 7 days
              </span>
            </div>
            <div className="flex flex-col p-3 sm:p-4 rounded-lg bg-yellow-50">
              <span className="font-semibold text-yellow-600 text-sm">
                Stores
              </span>
              <div className="flex gap-4 sm:gap-6 mt-1">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-lg">
                    {stores.length}
                  </span>
                  <span className="text-gray-400 text-xs">
                    Last 7 days
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-lg">
                    $2000
                  </span>
                  <span className="text-gray-400 text-xs">
                    Revenue
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col p-3 sm:p-4 rounded-lg bg-purple-50">
              <span className="font-semibold text-purple-600 text-sm">
                Top Selling
              </span>
              <div className="flex gap-4 sm:gap-6 mt-1">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-lg">
                    5
                  </span>
                  <span className="text-gray-400 text-xs">
                    Last 7 days
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-lg">
                    $1500
                  </span>
                  <span className="text-gray-400 text-xs">Cost</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col p-3 sm:p-4 rounded-lg bg-red-50">
              <span className="font-semibold text-red-600 text-sm">
                Low Stocks
              </span>
              <div className="flex gap-4 sm:gap-6 mt-1">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-lg">
                    12
                  </span>
                  <span className="text-gray-400 text-xs">
                    Ordered
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-lg">
                    2
                  </span>
                  <span className="text-gray-400 text-xs">
                    Not in Stock
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showProductModal && (
          <AddProduct
            addProductModalSetting={addProductModalSetting}
            handlePageUpdate={handlePageUpdate}
          />
        )}
        {showUpdateModal && (
          <UpdateProduct
            updateProductData={updateProduct}
            updateModalSetting={updateProductModalSetting}
          />
        )}

        {/* Products Table */}
        <div className="rounded-xl border bg-white border-gray-100 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-5 pb-3 px-4">
            <div className="flex gap-4 items-center">
              <span className="font-bold text-gray-800">Products</span>
              <div className="flex items-center px-3 border border-gray-200 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all duration-200">
                <img
                  alt="search-icon"
                  className="w-4 h-4 flex-shrink-0 opacity-50"
                  src={require("../assets/search-icon.png")}
                />
                <input
                  className="border-none outline-none focus:border-none text-sm bg-transparent py-1.5 pl-2 w-full min-w-0"
                  type="text"
                  placeholder="Search here"
                  value={searchTerm}
                  onChange={handleSearchTerm}
                />
              </div>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 text-sm rounded-lg transition-colors duration-150"
                onClick={addProductModalSetting}
              >
                Add Product
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                    Products
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                    Manufacturer
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700 hidden sm:table-cell">
                    Description
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                    Availability
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                    More
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.map((element, index) => {
                  return (
                    <tr key={element._id} className="hover:bg-gray-50 transition-colors duration-100">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                        {element.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {element.manufacturer}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {element.stock}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate hidden sm:table-cell">
                        {element.description}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          element.stock > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {element.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className="text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium text-sm mr-3 transition-colors"
                          onClick={() => updateProductModalSetting(element)}
                        >
                          Edit
                        </span>
                        <span
                          className="text-red-500 hover:text-red-700 cursor-pointer font-medium text-sm transition-colors"
                          onClick={() => deleteItem(element._id)}
                        >
                          Delete
                        </span>
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

export default Inventory;
