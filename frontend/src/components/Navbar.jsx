import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { ShoppingBasket, Search, User, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import logo from "../assets/EbookLogo.png";

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getLinkClass = (path) => {
    const baseClass = "transition-colors uppercase";
    const activeClass = "text-brand-red font-bold";
    const inactiveClass = "hover:text-brand-red";
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  const getMobileLinkClass = (path) => {
    const baseClass = "font-medium uppercase";
    const activeClass = "text-brand-red font-bold";
    const inactiveClass = "text-gray-600 hover:text-brand-red";
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full border border-red-500 flex items-center justify-center transition-colors overflow-hidden">
            <img src={logo} alt="OneHeart Logo" className="w-full h-full object-cover" />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 font-sans text-sm font-medium tracking-wide text-gray-600">
          <Link to="/" className={getLinkClass("/")}>HOME</Link>
          <Link to="/books" className={getLinkClass("/books")}>BOOKS</Link>
          <Link to="/blog" className={getLinkClass("/blog")}>ARTICLES</Link>
          <Link to="/contact" className={getLinkClass("/contact")}>Contact</Link>
          <Link to="/about" className={getLinkClass("/about")}>About Us</Link>
          {isAuthenticated && (
            <Link to="/library" className={getLinkClass("/library")}>Library</Link>
          )}
        </div>

        <div className="flex items-center gap-4 md:gap-4">
          <Link to="/cart" className="w-10 h-10 rounded-full border border-gray-200 bg-brand-red text-white flex items-center justify-center group-hover:border-brand-red transition-colors relative text-brand-red">
            <ShoppingBasket size={24} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-[var(--color-brand-red)] text-white px-6 py-2.5 rounded-full font-medium hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <User size={18} />
              <span>Sign In</span>
            </Link>
          )}

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 group">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors overflow-hidden ${isActive("/profile") ? "border-brand-red bg-red-50 text-brand-red" : "border-gray-200 bg-brand-red text-white group-hover:border-brand-red"}`}>
                  <User size={24} />
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-full border border-gray-200 bg-brand-red text-white flex items-center justify-center group-hover:border-brand-red transition-colors overflow-hidden"
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
          <Link to="/" className={getMobileLinkClass("/")} onClick={() => setIsMobileMenuOpen(false)}>HOME</Link>
          <Link to="/books" className={getMobileLinkClass("/books")} onClick={() => setIsMobileMenuOpen(false)}>BOOKS</Link>
          <Link to="/blog" className={getMobileLinkClass("/blog")} onClick={() => setIsMobileMenuOpen(false)}>ARTICLES</Link>
          <Link to="/contact" className={getMobileLinkClass("/contact")} onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
          <Link to="/about" className={getMobileLinkClass("/about")} onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          {isAuthenticated && (
            <Link to="/library" className={getMobileLinkClass("/library")} onClick={() => setIsMobileMenuOpen(false)}>Library</Link>
          )}

          {!isAuthenticated ? (
            <Link to="/login" className="text-brand-red font-medium uppercase" onClick={() => setIsMobileMenuOpen(false)}>Login/ Register</Link>
          ) : (
            <>
              <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
                <Link to="/profile" className={`flex items-center gap-2 ${isActive("/profile") ? "text-brand-red font-bold" : "text-gray-600 hover:text-brand-red"}`} onClick={() => setIsMobileMenuOpen(false)}>
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