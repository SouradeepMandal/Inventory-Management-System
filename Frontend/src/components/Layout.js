import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideMenu from "./SideMenu";

function Layout() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-30">
        <Header />
      </div>

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on small, shown on lg */}
        <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-56 xl:w-64">
          <SideMenu />
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
