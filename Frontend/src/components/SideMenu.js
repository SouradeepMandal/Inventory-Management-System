import React from "react";
import { Link, useLocation } from "react-router-dom";

function SideMenu() {
  const localStorageData = JSON.parse(localStorage.getItem("user")) || {};
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", href: "/", icon: require("../assets/dashboard-icon.png") },
    { name: "Inventory", href: "/inventory", icon: require("../assets/inventory-icon.png") },
    { name: "Purchase Details", href: "/purchase-details", icon: require("../assets/supplier-icon.png") },
    { name: "Sales", href: "/sales", icon: require("../assets/supplier-icon.png") },
    { name: "Manage Store", href: "/manage-store", icon: require("../assets/order-icon.png") },
  ];

  return (
    <div className="h-full flex flex-col justify-between bg-white border-r border-gray-200 w-full">
      <div className="px-4 py-6">
        <nav aria-label="Main Nav" className="mt-2 flex flex-col space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <img
                  alt={`${item.name}-icon`}
                  src={item.icon}
                  className="w-5 h-5 flex-shrink-0"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3">
          {localStorageData.imageUrl ? (
            <img
              alt="Profile"
              src={localStorageData.imageUrl}
              className="h-9 w-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 font-semibold text-sm">
                {(localStorageData.firstName || "U").charAt(0)}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {(localStorageData.firstName || "") + " " + (localStorageData.lastName || "")}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {localStorageData.email || ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
