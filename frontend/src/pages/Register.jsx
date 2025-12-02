// frontend/src/pages/Register.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/auth/authSlice";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState(""); // USERNAME FIELD
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, registrationMessage } = useSelector(
    (state) => state.auth
  );

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send EXACT payload that backend expects
    const form = {
      username,
      email,
      password,
    };

    const result = await dispatch(register(form));

    if (register.fulfilled.match(result)) {
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row-reverse">

        {/* Right side */}
        <div className="md:w-1/2 bg-brand-dark text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
              <span className="text-[10px] font-bold text-center leading-tight text-white">
                One<br /><span className="text-brand-red">Heart</span>
              </span>
            </div>
            <h2 className="text-3xl font-bold font-serif mb-4">Join Our Community</h2>
            <p className="text-gray-300 leading-relaxed">
              Create an account to unlock exclusive content, personalized recommendations, and seamless shopping.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <p className="text-sm text-gray-400">Already have an account?</p>
            <Link to="/login" className="text-white font-semibold hover:text-brand-red transition-colors inline-flex items-center gap-2 mt-2">
              Sign in here <ArrowRight size={16} />
            </Link>
          </div>

          <div className="absolute top-0 left-0 -ml-20 -mt-20 w-64 h-64 rounded-full bg-brand-red/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl"></div>
        </div>

        {/* Left side (form) */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center md:text-left">Create Account</h3>

          {registrationMessage && (
            <div className="text-xs text-green-600 mb-4">
              {registrationMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {typeof error === "object" ? (
                <ul className="list-disc list-inside">
                  {Object.entries(error).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-semibold capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                      {Array.isArray(value) ? value.join(" ") : value}
                    </li>
                  ))}
                </ul>
              ) : (
                error
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* USERNAME FIELD (renamed from Full Name) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all"
                  placeholder="alvee9909"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-red text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                "Register"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
