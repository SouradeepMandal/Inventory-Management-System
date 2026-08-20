import React, { useState, useEffect, useContext } from "react";
import AddStore from "../components/AddStore";
import AuthContext from "../AuthContext";
import API_BASE_URL from "../config";

function Store() {
  const [showModal, setShowModal] = useState(false);
  const [stores, setAllStores] = useState([]);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = () => {
    fetch(`${API_BASE_URL}/api/store/get/${authContext.user?._id || authContext.user}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setAllStores(data);
      });
  };

  const modalSetting = () => {
    setShowModal(!showModal);
  };

  const deleteStore = (id) => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      fetch(`${API_BASE_URL}/api/store/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then((response) => response.json())
        .then((data) => {
          fetchData();
        })
        .catch((error) => console.error("Error deleting store:", error));
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="font-bold text-gray-800 text-lg">Manage Store</span>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 text-sm rounded-lg transition-colors duration-150"
            onClick={modalSetting}
          >
            Add Store
          </button>
        </div>
        {showModal && <AddStore addStoreModalSetting={modalSetting} handlePageUpdate={fetchData} />}

        {/* Store Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stores.map((element, index) => {
            return (
              <div
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                key={element._id}
              >
                <div className="aspect-video w-full overflow-hidden group">
                  <img
                    alt="store"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={element.image}
                  />
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800">{element.name}</span>
                    <button onClick={() => deleteStore(element._id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Delete</button>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <img
                      alt="location-icon"
                      className="h-4 w-4 flex-shrink-0"
                      src={require("../assets/location-icon.png")}
                    />
                    <span className="truncate">{element.address + ", " + element.city}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Store;
