import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
                {/* Brand */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                            <span className="text-[10px] font-bold text-center leading-tight text-green-600">One<br /><span className="text-red-500">Heart</span></span>
                        </div>
                        <span className="text-xl font-bold font-serif">OneHeart Ebooks</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Empowering minds through the joy of reading. Discover your next favorite book with us.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-bold font-serif mb-6">Quick Links</h4>
                    <ul className="space-y-3 text-gray-400 text-sm">
                        <li><Link to="/" className="hover:text-brand-red transition-colors">Home</Link></li>
                        <li><Link to="/books" className="hover:text-brand-red transition-colors">Books</Link></li>
                        <li><Link to="/blog" className="hover:text-brand-red transition-colors">Articles</Link></li>
                        <li><Link to="/about" className="hover:text-brand-red transition-colors">About Us</Link></li>
                        <li><Link to="/contact" className="hover:text-brand-red transition-colors">Contact</Link></li>
                    </ul>
                </div>

                {/* Categories */}
                <div>
                    <h4 className="text-lg font-bold font-serif mb-6">Categories</h4>
                    <ul className="space-y-3 text-gray-400 text-sm">
                        <li><Link to="/books?category=education" className="hover:text-brand-red transition-colors">Education</Link></li>
                        <li><Link to="/books?category=parenting" className="hover:text-brand-red transition-colors">Parenting</Link></li>
                        <li><Link to="/books?category=science" className="hover:text-brand-red transition-colors">Science</Link></li>
                        <li><Link to="/books?category=fiction" className="hover:text-brand-red transition-colors">Fiction</Link></li>
                        <li><Link to="/books?category=sports" className="hover:text-brand-red transition-colors">Sports</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-lg font-bold font-serif mb-6">Contact Us</h4>
                    <ul className="space-y-4 text-gray-400 text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="mt-1 text-brand-red" />
                            <span>123 Book Street, Knowledge City, Dhaka, Bangladesh</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="text-brand-red" />
                            <span>+880 1234 567890</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="text-brand-red" />
                            <span>support@oneheartebooks.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} OneHeart Ebooks. All rights reserved.</p>
            </div>
        </footer>
    );
}