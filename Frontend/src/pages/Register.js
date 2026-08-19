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
    verificationMethod: "email",
  });
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState(null);
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

    if (form.verificationMethod === 'phone' && !form.phoneNumber) {
      setErrorMsg("Please provide a phone number for SMS verification.");
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

      if (response.ok && data.requiresVerification) {
        setRegisteredUserId(data.userId);
        setStep(2);
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

  const verifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otp) {
      setErrorMsg("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: registeredUserId, otp }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        authContext.signin(data.user, () => {
          navigate("/");
        });
      } else {
        setErrorMsg(data.message || "Verification failed.");
      }
    } catch (err) {
      console.error("Verification Error: ", err);
      setErrorMsg("Unable to connect to backend server.");
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
                {step === 1 ? "Create your account" : "Verify your identity"}
              </h2>
              <p className="mt-1 text-center text-sm text-gray-600">
                {step === 1 ? "Start managing stock & inventory today" : `Check your ${form.verificationMethod === 'email' ? 'email' : 'phone'} for the 6-digit OTP code.`}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            {step === 1 ? (
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
                    type="tel"
                    autoComplete="phoneNumber"
                    required={form.verificationMethod === 'phone'}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder={`Phone Number ${form.verificationMethod === 'phone' ? '(Required)' : '(Optional)'}`}
                    value={form.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="verificationMethod"
                      value="email"
                      checked={form.verificationMethod === 'email'}
                      onChange={handleInputChange}
                      className="text-indigo-600 focus:ring-indigo-600"
                    />
                    Verify via Email
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="verificationMethod"
                      value="phone"
                      checked={form.verificationMethod === 'phone'}
                      onChange={handleInputChange}
                      className="text-indigo-600 focus:ring-indigo-600"
                    />
                    Verify via Phone (SMS)
                  </label>
                </div>

                <UploadImage uploadImage={uploadImage} label="Upload Profile Picture (Optional)" inputId="profilePicInput" />

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 transition duration-150 disabled:opacity-50"
                  >
                    {loading ? "Sending OTP..." : "Sign up"}
                  </button>
                  <p className="mt-3 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={verifyOTP}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {form.verificationMethod === 'email' ? 'Email OTP' : 'Phone OTP'}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 group relative flex w-full justify-center rounded-md bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition duration-150 disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-3 group relative flex w-full justify-center rounded-md bg-white border border-gray-300 py-2.5 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition duration-150"
                  >
                    Back to Registration
                  </button>
                </div>
              </form>
            )}
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
