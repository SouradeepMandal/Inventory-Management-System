import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Inventory from "./pages/Inventory";
import NoPageFound from "./pages/NoPageFound";
import AuthContext from "./AuthContext";
import ProtectedWrapper from "./ProtectedWrapper";
import Store from "./pages/Store";
import Sales from "./pages/Sales";
import PurchaseDetails from "./pages/PurchaseDetails";
import API_BASE_URL from "./config";
import "./index.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/user/me`, {
            headers: {
              "Authorization": `Bearer ${storedToken}`
            }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        } catch (err) {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } else {
        setUser(null);
      }
      setLoader(false);
    };

    verifyUser();
  }, []);

  const signin = (newUser, callback) => {
    setUser(newUser);
    if (callback) callback();
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = { user, signin, signout };

  if (loader) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <h1 className="text-xl font-semibold text-gray-700">Loading Inventory System...</h1>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedWrapper>
                <Layout />
              </ProtectedWrapper>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchase-details" element={<PurchaseDetails />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/manage-store" element={<Store />} />
          </Route>
          <Route path="*" element={<NoPageFound />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
