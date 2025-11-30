import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadBooks } from "../features/books/booksSlice";

import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Star, ShoppingCart, ChevronDown, BookOpen, X, Clock, Tag } from "lucide-react";
import { addToCart } from "../features/cart/cartSlice";
import axios from "axios";

// ... (BookDetailsPanel component remains unchanged)

export default function BooksPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: books, loading, error } = useSelector((state) => state.books);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [sortBy, setSortBy] = useState("newest");
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Selected Book for Slide-over
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        dispatch(loadBooks());
    }, [dispatch]);

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(books.map(b => b.category).filter(Boolean));
        return ["All", ...Array.from(cats)];
    }, [books]);

    // Filter and Sort Logic
    const filteredBooks = useMemo(() => {
        return books
            .filter(book => {
                const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.author?.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
                const matchesPrice = (book.price || 0) >= priceRange[0] && (book.price || 0) <= priceRange[1];
                return matchesSearch && matchesCategory && matchesPrice;
            })
            .sort((a, b) => {
                if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
                if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
                if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
                return b.id - a.id;
            });
    }, [books, searchTerm, selectedCategory, priceRange, sortBy]);

    const handleAddToCart = (e, book) => {
        e.stopPropagation(); // Prevent opening details when clicking add to cart
        e.preventDefault();
        dispatch(addToCart(book));
    };

    const openBookDetails = (e, book) => {
        e.preventDefault();
        setSelectedBook(book);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-red"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Book Details Slide-over */}
            {selectedBook && (
                <BookDetailsPanel
                    initialBook={selectedBook}
                    onClose={() => setSelectedBook(null)}
                />
            )}

            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold font-serif text-gray-900">Browse Books</h1>
                    <p className="text-gray-500 mt-2">Explore our extensive collection of books across various genres.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Mobile Filter Toggle */}
                    <button
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 font-medium"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                    >
                        <Filter size={18} /> Filters
                    </button>

                    {/* Sidebar Filters */}
                    <div className={`lg:w-64 flex-shrink-0 space-y-8 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>

                        {/* Search */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Search</h3>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Title, author..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-sm"
                                />
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedCategory === cat ? 'border-brand-red' : 'border-gray-300 group-hover:border-brand-red'}`}>
                                            {selectedCategory === cat && <div className="w-2 h-2 rounded-full bg-brand-red" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="category"
                                            value={cat}
                                            checked={selectedCategory === cat}
                                            onChange={() => setSelectedCategory(cat)}
                                            className="hidden"
                                        />
                                        <span className={`text-sm ${selectedCategory === cat ? 'text-brand-red font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                <span>${priceRange[0]}</span>
                                <span className="flex-1 h-px bg-gray-200"></span>
                                <span>${priceRange[1]}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="2000"
                                step="50"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                className="w-full accent-brand-red"
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                            <p className="text-gray-500 text-sm">Showing <span className="font-bold text-gray-900">{filteredBooks.length}</span> results</p>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort by:</span>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-8 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-brand-red cursor-pointer"
                                    >
                                        <option value="newest">Newest Arrivals</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Top Rated</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Books Grid */}
                        {filteredBooks.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredBooks.map((book) => (
                                    <div
                                        key={book.id}
                                        onClick={(e) => openBookDetails(e, book)}
                                        className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col cursor-pointer"
                                    >
                                        <div
                                            className="relative aspect-[2/3] overflow-hidden bg-gray-100 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/books/${book.slug}`);
                                            }}
                                        >
                                            {book.cover_image ? (
                                                <img
                                                    src={book.cover_image}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <BookOpen size={48} />
                                                </div>
                                            )}
                                            {/* Quick Add Button */}
                                            <button
                                                onClick={(e) => handleAddToCart(e, book)}
                                                className="absolute bottom-4 right-4 bg-white text-brand-red p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-brand-red hover:text-white"
                                            >
                                                <ShoppingCart size={20} />
                                            </button>
                                        </div>

                                        <div className="p-4 flex flex-col flex-grow">
                                            <div className="text-xs text-gray-500 mb-1">{book.category || "Uncategorized"}</div>
                                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-brand-red transition-colors">{book.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">{book.author}</p>

                                            <div className="mt-auto flex items-center justify-between">
                                                <span className="text-lg font-bold text-brand-red">${book.price}</span>
                                                <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                                    <Star size={12} fill="currentColor" />
                                                    <span className="text-gray-600 font-medium">{book.rating || "4.5"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No books found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters.</p>
                                <button
                                    onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setPriceRange([0, 1000]); }}
                                    className="mt-4 text-brand-red font-medium hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}
