import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import UploadImage from "../components/UploadImage";
import AuthContext from "../AuthContext";
import API_BASE_URL from "../config";

// Live countdown timer
function OtpTimer({ onExpire }) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const ref = useRef(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(ref.current);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const s = (timeLeft % 60).toString().padStart(2, "0");
  const isLow = timeLeft <= 60;

  return (
    <span className={`text-xs font-semibold ${isLow ? "text-red-500" : "text-indigo-500"}`}>
      {m}:{s}
    </span>
  );
}

function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    imageUrl: "",
  });

  // UI state
  const [phase, setPhase] = useState("details"); // details | otp_sent | otp_verified | done
  const [otp, setOtp] = useState("");
  const [otpExpired, setOtpExpired] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Backend state
  const [userId, setUserId] = useState(null);
  const [registrationToken, setRegistrationToken] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- 1. Send OTP ---
  const sendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.firstName || !form.lastName || !form.email) {
      setErrorMsg("Please fill in your name and email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          imageUrl: form.imageUrl,
        }),
      });
      const data = await res.json();
      if (res.ok && data.userId) {
        setUserId(data.userId);
        setOtpExpired(false);
        setPhase("otp_sent");
      } else {
        setErrorMsg(data.message || "Failed to send OTP.");
      }
    } catch {
      setErrorMsg("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Verify OTP ---
  const verifyOtp = async () => {
    setErrorMsg("");
    if (!otp || otp.length !== 6) {
      setErrorMsg("Please enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });
      const data = await res.json();
      if (res.ok && data.registrationToken) {
        setRegistrationToken(data.registrationToken);
        setPhase("otp_verified");
      } else {
        setErrorMsg(data.message || "Invalid OTP.");
      }
    } catch {
      setErrorMsg("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Set Password ---
  const completeRegistration = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationToken, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        authContext.signin(data.user, () => navigate("/"));
      } else {
        setErrorMsg(data.message || "Failed to create account.");
      }
    } catch {
      setErrorMsg("Unable to connect to the server.");
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

          {/* Form Card */}
          <div className="w-full max-w-md p-6 sm:p-10 bg-white rounded-xl shadow-lg border border-gray-100 order-2 sm:order-1 space-y-5">
            <div>
              <img className="mx-auto h-12 w-auto" src={require("../assets/logo.png")} alt="Inventory Management" />
              <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Create your account
              </h2>
              <p className="mt-1 text-center text-sm text-gray-600">
                Start managing stock &amp; inventory today
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={phase === "otp_verified" ? completeRegistration : sendOtp} className="space-y-4">

              {/* ── Name Fields ── */}
              <div className="flex gap-3">
                <input
                  name="firstName" type="text" required
                  disabled={phase !== "details"}
                  className="flex-1 rounded-md border border-gray-300 py-2 px-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="First Name"
                  value={form.firstName} onChange={handleInputChange}
                />
                <input
                  name="lastName" type="text" required
                  disabled={phase !== "details"}
                  className="flex-1 rounded-md border border-gray-300 py-2 px-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Last Name"
                  value={form.lastName} onChange={handleInputChange}
                />
              </div>

              {/* ── Email + Send OTP button ── */}
              <div>
                <div className="flex gap-2">
                  <input
                    name="email" type="email" required
                    disabled={phase !== "details"}
                    className="flex-1 rounded-md border border-gray-300 py-2 px-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Email address"
                    value={form.email} onChange={handleInputChange}
                  />
                  {phase === "details" && (
                    <button
                      type="submit" disabled={loading}
                      className="shrink-0 rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
                    >
                      {loading ? "Sending…" : "Send OTP"}
                    </button>
                  )}
                  {(phase === "otp_sent" || phase === "otp_verified") && (
                    <span className="shrink-0 flex items-center gap-1 text-xs text-green-600 font-medium px-2">
                      ✉️ Sent
                    </span>
                  )}
                </div>
              </div>

              {/* ── OTP Section (shown after OTP sent) ── */}
              {(phase === "otp_sent" || phase === "otp_verified") && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                  {phase === "otp_sent" && !otpExpired && (
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Enter the 6-digit code sent to <strong>{form.email}</strong></span>
                      <OtpTimer onExpire={() => setOtpExpired(true)} />
                    </div>
                  )}
                  {otpExpired && phase === "otp_sent" && (
                    <div className="text-xs text-red-600 flex items-center justify-between">
                      <span>OTP expired.</span>
                      <button
                        type="button"
                        className="underline font-semibold"
                        onClick={() => { setPhase("details"); setOtp(""); setErrorMsg(""); setOtpExpired(false); }}
                      >
                        Start over
                      </button>
                    </div>
                  )}

                  {phase === "otp_verified" ? (
                    <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Email verified successfully!
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
                        disabled={otpExpired}
                        className="flex-1 rounded-md border border-gray-300 py-2 px-3 text-gray-900 text-center text-xl font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-100"
                        placeholder="– – – – – –"
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setErrorMsg(""); }}
                      />
                      <button
                        type="button"
                        disabled={loading || otpExpired || otp.length !== 6}
                        onClick={verifyOtp}
                        className="shrink-0 rounded-md bg-indigo-600 py-2 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
                      >
                        {loading ? "…" : "Verify"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Password Section (shown after OTP verified) ── */}
              {phase === "otp_verified" && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Create Password</label>
                    <input
                      type="password" autoComplete="new-password" required minLength={6}
                      className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password</label>
                    <input
                      type="password" autoComplete="new-password" required
                      className={`w-full rounded-md border py-2 px-3 text-gray-900 text-sm focus:outline-none focus:ring-2 ${
                        confirmPassword && confirmPassword !== password
                          ? "border-red-400 focus:ring-red-400"
                          : "border-gray-300 focus:ring-indigo-600"
                      }`}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {confirmPassword && confirmPassword !== password && (
                      <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
                    )}
                  </div>

                  <UploadImage uploadImage={uploadImage} label="Upload Profile Picture (Optional)" inputId="profilePicInput" />

                  <button
                    type="submit" disabled={loading}
                    className="w-full flex justify-center rounded-md bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
                  >
                    {loading ? "Creating Account…" : "Create Account"}
                  </button>
                </div>
              )}

              {phase === "details" && (
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </Link>
                </p>
              )}
            </form>
          </div>

          {/* Illustration */}
          <div className="hidden sm:flex justify-center flex-1 max-w-sm order-1 sm:order-2">
            <img src={require("../assets/Login.png")} alt="Registration" className="w-full max-h-80 object-contain" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
