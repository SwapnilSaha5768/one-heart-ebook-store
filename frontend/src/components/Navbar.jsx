import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { ShoppingBasket, Search, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import logo from "../assets/EbookLogo.jpg";

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
          <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-brand-red transition-colors overflow-hidden">
            <img src={logo} alt="OneHeart Logo" className="w-full h-full object-cover" />
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
          {isAuthenticated && (
            <Link to="/library" className="hover:text-brand-red transition-colors uppercase">Library</Link>
          )}
        </div>

        <div className="flex items-center gap-4 md:gap-4">
          <Link to="/cart" className="relative text-brand-red hover:text-red-700 transition-colors">
            <ShoppingBasket size={24} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/profile" className="text-gray-600 hover:text-brand-red transition-colors" title="Profile">
                <User size={24} />
              </Link>
              <button
                onClick={handleLogout}
                className="text-brand-red hover:text-red-700 transition-colors"
                title="Logout"
              >
                <LogOut size={24} />
              </button>
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
              <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
                <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-brand-red" onClick={() => setIsMobileMenuOpen(false)}>
                  <User size={18} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-brand-red hover:text-red-700 w-full text-left"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}