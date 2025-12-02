import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { verifyEmailApi, resendOtpApi } from "../api/authApi";
import { Mail, Key, ArrowRight, CheckCircle, RefreshCw } from "lucide-react";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyEmail() {
  const query = useQuery();
  const initialEmail = query.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");


  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await verifyEmailApi(email, code);
      setMessage("Email verified! You can now log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setResendMessage("");

    try {
      const res = await resendOtpApi(email);
      setResendMessage(res.data?.detail || "New code sent to your email.");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Could not resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">

        {/* Left Side - Image/Brand */}
        <div className="md:w-1/2 bg-brand-dark text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
              <span className="text-[10px] font-bold text-center leading-tight text-white">One<br /><span className="text-brand-red">Heart</span></span>
            </div>
            <h2 className="text-3xl font-bold font-serif mb-4">Verify Your Email</h2>
            <p className="text-gray-300 leading-relaxed">
              We need to verify your email address to ensure your account security and provide you with important updates.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <p className="text-sm text-gray-400">Already verified?</p>
            <Link to="/login" className="text-white font-semibold hover:text-brand-red transition-colors inline-flex items-center gap-2 mt-2">
              Login to your account <ArrowRight size={16} />
            </Link>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-red/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center md:text-left">Enter Verification Code</h3>
          <p className="text-gray-500 mb-8 text-center md:text-left">
            We've sent a 6-digit code to your email. Enter it below to activate your account.
          </p>

          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle size={16} /> {message}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {resendMessage && (
            <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle size={16} /> {resendMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly={!!initialEmail}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Key size={18} />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all tracking-widest"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  required
                  placeholder="000000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-red text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>

            <div className="pt-4 border-t border-gray-100 mt-6">
              <p className="text-sm text-gray-500 text-center mb-3">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resendLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin"></div>
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} /> Resend Code
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
