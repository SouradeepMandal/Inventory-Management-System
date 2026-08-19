import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";
import API_BASE_URL from "../config";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.email || !form.password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: form.email, password: form.password, rememberMe }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        authContext.signin(data.user, () => {
          navigate("/");
        });
      } else {
        setErrorMsg(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login Error: ", err);
      setErrorMsg("Unable to connect to backend server. Make sure server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 max-w-4xl w-full">
          {/* Illustration — hidden on very small, shown from sm up */}
          <div className="hidden sm:flex justify-center flex-1 max-w-sm">
            <img
              src={require("../assets/signup.jpg")}
              alt="Signup Illustration"
              className="w-full max-h-80 object-contain"
            />
          </div>

          {/* Login Form */}
          <div className="w-full max-w-md space-y-8 p-6 sm:p-10 bg-white rounded-xl shadow-lg border border-gray-100">
            <div>
              <img
                className="mx-auto h-12 w-auto"
                src={require("../assets/logo.png")}
                alt="Inventory Management"
              />
              <h2 className="mt-6 text-center text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Sign in to your account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Manage your stock, purchases, & sales seamlessly
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={loginUser}>
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="relative block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder="Email address"
                    value={form.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="relative block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  Remember me for 30 days
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 transition duration-150 disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
                <p className="mt-4 text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Register now
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
