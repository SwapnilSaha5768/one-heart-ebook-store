import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { ShoppingBasket, Search, User, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-brand-red transition-colors">
            <span className="text-[10px] font-bold text-center leading-tight text-green-600">One<br /><span className="text-red-500">Heart</span></span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 font-sans text-sm font-medium tracking-wide text-gray-600">
          <Link to="/" className="hover:text-brand-red transition-colors">HOME</Link>
          <Link to="/books" className="hover:text-brand-red transition-colors">BOOKS</Link>
          <Link to="/blog" className="hover:text-brand-red transition-colors">ARTICLES</Link>
          {!isAuthenticated && (
            <Link to="/login" className="hover:text-brand-red transition-colors uppercase">Login/ Register</Link>
          )}
        </div>

        {/* Right Side: Search & Cart & Mobile Toggle */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Cart */}
          <Link to="/cart" className="relative text-brand-red hover:text-red-700 transition-colors">
            <ShoppingBasket size={24} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Profile (Desktop) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/profile" className="text-gray-600 hover:text-brand-red">
                <User size={20} />
              </Link>
              <button onClick={handleLogout} className="text-xs text-red-500 hover:underline">Logout</button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 hover:text-brand-red focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute top-full left-0 right-0 shadow-lg py-4 px-6 flex flex-col space-y-4 animate-in slide-in-from-top-2">
          <Link to="/" className="text-gray-600 hover:text-brand-red font-medium" onClick={() => setIsMobileMenuOpen(false)}>HOME</Link>
          <Link to="/books" className="text-gray-600 hover:text-brand-red font-medium" onClick={() => setIsMobileMenuOpen(false)}>BOOKS</Link>
          <Link to="/blog" className="text-gray-600 hover:text-brand-red font-medium" onClick={() => setIsMobileMenuOpen(false)}>ARTICLES</Link>

          {!isAuthenticated ? (
            <Link to="/login" className="text-brand-red font-medium uppercase" onClick={() => setIsMobileMenuOpen(false)}>Login/ Register</Link>
          ) : (
            <>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-brand-red mb-3" onClick={() => setIsMobileMenuOpen(false)}>
                  <User size={18} /> Profile
                </Link>
                <button onClick={handleLogout} className="text-red-500 font-medium w-full text-left">Logout</button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
