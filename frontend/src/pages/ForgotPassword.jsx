import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPasswordRequestApi } from "../api/authApi";
import { User, ArrowRight, CheckCircle, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await forgotPasswordRequestApi(identifier);
      const email = res.data?.email;
      setMessage(res.data?.detail || "If an account exists, a code was sent.");
      if (email) {
        // go to reset page with email in query
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Could not start password reset.");
    } finally {
      setLoading(false);
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
            <h2 className="text-3xl font-bold font-serif mb-4">Account Recovery</h2>
            <p className="text-gray-300 leading-relaxed">
              Don't worry, it happens to the best of us. We'll help you recover your account and get you back to reading in no time.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <p className="text-sm text-gray-400">Remember your password?</p>
            <Link to="/login" className="text-white font-semibold hover:text-brand-red transition-colors inline-flex items-center gap-2 mt-2">
              Back to Login <ArrowRight size={16} />
            </Link>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-red/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center md:text-left">Forgot Password?</h3>
          <p className="text-gray-500 mb-8 text-center md:text-left">
            Enter your <strong>email</strong> or <strong>username</strong> and we'll send you a verification code.
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email or Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="Enter email or username"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-red text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending code...
                </>
              ) : (
                <>
                  Send Reset Code <Mail size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
