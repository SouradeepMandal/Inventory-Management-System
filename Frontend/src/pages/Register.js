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

    if (form.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        authContext.signin(data.user, () => navigate("/"));
      } else {
        setErrorMsg(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Network or parsing error:", err);
      setErrorMsg("Unable to connect to the server. Please check your network connection.");
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
      alert("Image upload failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 max-w-4xl w-full">

        {/* Form Card */}
        <div className="w-full max-w-md p-6 sm:p-10 bg-white rounded-xl shadow-lg border border-gray-100 order-2 sm:order-1">
          <div className="mb-6">
            <img className="mx-auto h-12 w-auto" src={require("../assets/logo.png")} alt="Inventory Management" />
            <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p className="mt-1 text-center text-sm text-gray-600">
              Start managing stock &amp; inventory today
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={registerUser} className="space-y-4">
            <div className="flex gap-3">
              <input
                name="firstName" type="text" required
                className="flex-1 min-w-0 rounded-md border border-gray-300 py-2 px-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="First Name"
                value={form.firstName} onChange={handleInputChange}
              />
              <input
                name="lastName" type="text" required
                className="flex-1 min-w-0 rounded-md border border-gray-300 py-2 px-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Last Name"
                value={form.lastName} onChange={handleInputChange}
              />
            </div>

            <input
              name="email" type="email" required
              className="w-full min-w-0 rounded-md border border-gray-300 py-2 px-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Email address"
              value={form.email} onChange={handleInputChange}
            />

            <input
              name="password" type="password" autoComplete="new-password" required minLength={6}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Create Password (min 6 chars)"
              value={form.password} onChange={handleInputChange}
            />

            <UploadImage uploadImage={uploadImage} label="Upload Profile Picture (Optional)" inputId="profilePicInput" />

            <button
              type="submit" disabled={loading}
              className="w-full mt-2 flex justify-center rounded-md bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        {/* Illustration */}
        <div className="hidden sm:flex justify-center flex-1 max-w-sm order-1 sm:order-2">
          <img src={require("../assets/Login.png")} alt="Registration" className="w-full max-h-80 object-contain" />
        </div>
      </div>
    </div>
  );
}

export default Register;
