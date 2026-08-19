import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import UploadImage from "../components/UploadImage";
import AuthContext from "../AuthContext";
import API_BASE_URL from "../config";

function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        authContext.signin(data.user, () => {
          navigate("/");
        });
      } else {
        setErrorMsg(data.message || "Registration failed. Please check details.");
      }
    } catch (err) {
      console.error("Register Error: ", err);
      setErrorMsg("Unable to connect to backend server. Make sure server is running.");
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (image) => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "inventoryapp");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/ddhayhptm/image/upload", {
        method: "POST",
        body: data,
      });
      const dataRes = await res.json();
      setForm({ ...form, imageUrl: dataRes.url });
      alert("Profile Image Uploaded Successfully!");
    } catch (error) {
      console.error("Image Upload Error: ", error);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 max-w-4xl w-full">
          {/* Registration Form */}
          <div className="w-full max-w-md space-y-6 p-6 sm:p-10 bg-white rounded-xl shadow-lg border border-gray-100 order-2 sm:order-1">
            <div>
              <img
                className="mx-auto h-12 w-auto"
                src={require("../assets/logo.png")}
                alt="Inventory Management"
              />
              <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Create your account
              </h2>
              <p className="mt-1 text-center text-sm text-gray-600">
                Start managing stock & inventory today
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            <form className="space-y-4" onSubmit={registerUser}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex-1">
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <input
                  name="phoneNumber"
                  type="number"
                  autoComplete="phoneNumber"
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  placeholder="Phone Number (Optional)"
                  value={form.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>

              <UploadImage uploadImage={uploadImage} label="Upload Profile Picture (Optional)" />

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 transition duration-150 disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Sign up"}
                </button>
                <p className="mt-3 text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Illustration — hidden on very small, shown from sm */}
          <div className="hidden sm:flex justify-center flex-1 max-w-sm order-1 sm:order-2">
            <img src={require("../assets/Login.png")} alt="Registration" className="w-full max-h-80 object-contain" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
