import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import UploadImage from "../components/UploadImage";
import AuthContext from "../AuthContext";
import API_BASE_URL from "../config";

// Common country dial codes
const COUNTRY_CODES = [
  { code: "+1", country: "US/CA" },
  { code: "+7", country: "RU" },
  { code: "+20", country: "EG" },
  { code: "+27", country: "ZA" },
  { code: "+30", country: "GR" },
  { code: "+31", country: "NL" },
  { code: "+32", country: "BE" },
  { code: "+33", country: "FR" },
  { code: "+34", country: "ES" },
  { code: "+36", country: "HU" },
  { code: "+39", country: "IT" },
  { code: "+40", country: "RO" },
  { code: "+41", country: "CH" },
  { code: "+43", country: "AT" },
  { code: "+44", country: "GB" },
  { code: "+45", country: "DK" },
  { code: "+46", country: "SE" },
  { code: "+47", country: "NO" },
  { code: "+48", country: "PL" },
  { code: "+49", country: "DE" },
  { code: "+51", country: "PE" },
  { code: "+52", country: "MX" },
  { code: "+54", country: "AR" },
  { code: "+55", country: "BR" },
  { code: "+56", country: "CL" },
  { code: "+57", country: "CO" },
  { code: "+60", country: "MY" },
  { code: "+61", country: "AU" },
  { code: "+62", country: "ID" },
  { code: "+63", country: "PH" },
  { code: "+64", country: "NZ" },
  { code: "+65", country: "SG" },
  { code: "+66", country: "TH" },
  { code: "+81", country: "JP" },
  { code: "+82", country: "KR" },
  { code: "+84", country: "VN" },
  { code: "+86", country: "CN" },
  { code: "+90", country: "TR" },
  { code: "+91", country: "IN" },
  { code: "+92", country: "PK" },
  { code: "+93", country: "AF" },
  { code: "+94", country: "LK" },
  { code: "+95", country: "MM" },
  { code: "+98", country: "IR" },
  { code: "+212", country: "MA" },
  { code: "+213", country: "DZ" },
  { code: "+216", country: "TN" },
  { code: "+218", country: "LY" },
  { code: "+220", country: "GM" },
  { code: "+234", country: "NG" },
  { code: "+254", country: "KE" },
  { code: "+255", country: "TZ" },
  { code: "+256", country: "UG" },
  { code: "+260", country: "ZM" },
  { code: "+263", country: "ZW" },
  { code: "+351", country: "PT" },
  { code: "+353", country: "IE" },
  { code: "+358", country: "FI" },
  { code: "+380", country: "UA" },
  { code: "+420", country: "CZ" },
  { code: "+880", country: "BD" },
  { code: "+966", country: "SA" },
  { code: "+971", country: "AE" },
  { code: "+972", country: "IL" },
  { code: "+977", country: "NP" },
];

// Countdown timer component
function CountdownTimer({ seconds, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(seconds);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");
  const isLow = timeLeft <= 60;

  return (
    <div className={`flex items-center justify-center gap-2 text-sm font-semibold ${isLow ? "text-red-600" : "text-indigo-600"}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      OTP expires in {mins}:{secs}
    </div>
  );
}

function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+91",
    imageUrl: "",
    verificationMethod: "email",
  });
  const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Password
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState(null);
  const [registrationToken, setRegistrationToken] = useState(null);
  const [otpExpired, setOtpExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP
  const registerUser = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.firstName || !form.lastName) {
      setErrorMsg("Please fill in your first and last name.");
      return;
    }
    if (form.verificationMethod === "email" && !form.email) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (form.verificationMethod === "phone" && !form.phoneNumber) {
      setErrorMsg("Please enter your phone number.");
      return;
    }

    const fullPhone = form.verificationMethod === "phone"
      ? form.countryCode + form.phoneNumber
      : (form.phoneNumber ? form.countryCode + form.phoneNumber : undefined);

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || undefined,
          phoneNumber: fullPhone,
          imageUrl: form.imageUrl,
          verificationMethod: form.verificationMethod,
        }),
      });

      const data = await response.json();

      if (response.ok && data.requiresVerification) {
        setRegisteredUserId(data.userId);
        setOtpExpired(false);
        setStep(2);
      } else {
        setErrorMsg(data.message || "Registration failed. Please check your details.");
      }
    } catch (err) {
      console.error("Register Error: ", err);
      setErrorMsg("Unable to connect to the server. Make sure it is running.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otp || otp.length !== 6) {
      setErrorMsg("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: registeredUserId, otp }),
      });

      const data = await response.json();

      if (response.ok && data.registrationToken) {
        setRegistrationToken(data.registrationToken);
        setStep(3);
      } else {
        setErrorMsg(data.message || "Verification failed.");
      }
    } catch (err) {
      console.error("Verification Error: ", err);
      setErrorMsg("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set Password
  const setPasswordFn = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!password) {
      setErrorMsg("Please enter a password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationToken, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        authContext.signin(data.user, () => {
          navigate("/");
        });
      } else {
        setErrorMsg(data.message || "Failed to set password.");
      }
    } catch (err) {
      console.error("Set Password Error: ", err);
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

  const stepTitles = {
    1: { title: "Create your account", subtitle: "Start managing stock & inventory today" },
    2: {
      title: "Verify your identity",
      subtitle: `Check your ${form.verificationMethod === "email" ? "email inbox" : "phone messages"} for the 6-digit code.`,
    },
    3: { title: "Set your password", subtitle: "Almost done! Choose a strong password to secure your account." },
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 max-w-4xl w-full">

          {/* Registration Form */}
          <div className="w-full max-w-md space-y-6 p-6 sm:p-10 bg-white rounded-xl shadow-lg border border-gray-100 order-2 sm:order-1">
            <div>
              <img className="mx-auto h-12 w-auto" src={require("../assets/logo.png")} alt="Inventory Management" />

              {/* Step indicator */}
              <div className="flex justify-center gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      s === step ? "w-8 bg-indigo-600" : s < step ? "w-4 bg-indigo-300" : "w-4 bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                {stepTitles[step].title}
              </h2>
              <p className="mt-1 text-center text-sm text-gray-600">
                {stepTitles[step].subtitle}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* ---- STEP 1: Details ---- */}
            {step === 1 && (
              <form className="space-y-4" onSubmit={registerUser}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      name="firstName" type="text" required
                      className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                      placeholder="First Name"
                      value={form.firstName} onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      name="lastName" type="text" required
                      className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                      placeholder="Last Name"
                      value={form.lastName} onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Verification method selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, verificationMethod: "email" })}
                    className={`py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      form.verificationMethod === "email"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    📧 Email OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, verificationMethod: "phone" })}
                    className={`py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      form.verificationMethod === "phone"
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    📱 Phone OTP
                  </button>
                </div>

                {/* Email field */}
                <div>
                  <input
                    name="email" type="email" autoComplete="email"
                    required={form.verificationMethod === "email"}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder={`Email address${form.verificationMethod === "email" ? " (Required)" : " (Optional)"}`}
                    value={form.email} onChange={handleInputChange}
                  />
                </div>

                {/* Phone field with country code */}
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={form.countryCode}
                    onChange={handleInputChange}
                    className="rounded-md border border-gray-300 py-2 px-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code + c.country} value={c.code}>
                        {c.code} {c.country}
                      </option>
                    ))}
                  </select>
                  <input
                    name="phoneNumber" type="tel" autoComplete="tel"
                    required={form.verificationMethod === "phone"}
                    className="flex-1 rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder={`Phone number${form.verificationMethod === "phone" ? " (Required)" : " (Optional)"}`}
                    value={form.phoneNumber} onChange={handleInputChange}
                  />
                </div>

                <UploadImage uploadImage={uploadImage} label="Upload Profile Picture (Optional)" inputId="profilePicInput" />

                <div>
                  <button
                    type="submit" disabled={loading}
                    className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition duration-150 disabled:opacity-50"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                  <p className="mt-3 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            )}

            {/* ---- STEP 2: OTP Verification ---- */}
            {step === 2 && (
              <form className="space-y-4" onSubmit={verifyOTP}>
                {!otpExpired ? (
                  <CountdownTimer seconds={600} onExpire={() => setOtpExpired(true)} />
                ) : (
                  <div className="p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    ⏰ OTP expired.{" "}
                    <button
                      type="button"
                      className="font-semibold underline"
                      onClick={() => { setStep(1); setOtpExpired(false); setOtp(""); setErrorMsg(""); }}
                    >
                      Register again
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {form.verificationMethod === "email" ? "Email OTP" : "Phone OTP"}
                  </label>
                  <input
                    type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
                    required disabled={otpExpired}
                    className="w-full rounded-md border border-gray-300 py-2.5 px-3 text-gray-900 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm disabled:bg-gray-50"
                    placeholder="––––––"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="submit" disabled={loading || otpExpired}
                    className="flex w-full justify-center rounded-md bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition duration-150 disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtp(""); setErrorMsg(""); setOtpExpired(false); }}
                    className="flex w-full justify-center rounded-md border border-gray-300 py-2.5 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition duration-150"
                  >
                    ← Back
                  </button>
                </div>
              </form>
            )}

            {/* ---- STEP 3: Set Password ---- */}
            {step === 3 && (
              <form className="space-y-4" onSubmit={setPasswordFn}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password" autoComplete="new-password" required minLength={6}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password" autoComplete="new-password" required
                    className={`w-full rounded-md border py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-400 focus:ring-red-400"
                        : "border-gray-300 focus:ring-indigo-600"
                    }`}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {confirmPassword && confirmPassword !== password && (
                    <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
                  )}
                </div>

                <button
                  type="submit" disabled={loading}
                  className="flex w-full justify-center rounded-md bg-indigo-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-indigo-500 transition duration-150 disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}
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
