import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
import { X, Star, ShoppingCart, BookOpen, Clock, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BookDetailsPanel({ initialBook, onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [book, setBook] = useState(initialBook);

    // If we wanted to fetch fresh details, we could do it here using initialBook.slug
    // For now, we'll use the passed book object

    const handleAddToCart = () => {
        dispatch(addToCart({ bookId: book.id }));
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold font-serif text-gray-900">Book Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Cover */}
                        <div className="w-full md:w-1/3 flex-shrink-0">
                            <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-gray-100 relative">
                                {book.cover_image ? (
                                    <img
                                        src={book.cover_image}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <BookOpen size={48} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-brand-red font-medium mb-2">
                                    {book.categories?.map(c => c.name).join(", ") || "Uncategorized"}
                                </div>
                                <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">{book.title}</h1>
                                <p className="text-lg text-gray-600">
                                    by <span className="font-medium text-gray-900">{book.authors?.map(a => a.name).join(", ") || "Unknown Author"}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <Star size={20} fill="currentColor" />
                                    <span className="text-gray-900 font-bold text-lg">{book.average_rating || "4.5"}</span>
                                    <span className="text-gray-500 text-sm ml-1">({book.reviews_count || 12} reviews)</span>
                                </div>
                            </div>

                            <div className="text-3xl font-bold text-brand-red">
                                ৳ {book.effective_price || book.price}
                                {book.discount_price && (
                                    <span className="text-lg text-gray-400 line-through ml-3 font-normal">
                                        ৳ {book.price}
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-600 leading-relaxed">
                                {book.description || "No description available for this book."}
                            </p>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Clock size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Published</p>
                                        <p className="font-medium">{new Date(book.created_at).getFullYear()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Tag size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Language</p>
                                        <p className="font-medium">{book.language || "English"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                    <button
                        onClick={() => navigate(`/books/${book.slug}`)}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-white hover:border-gray-400 transition-all"
                    >
                        View Full Details
                    </button>
                    <button
                        onClick={handleAddToCart}
                        className="flex-[2] px-6 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
                    >
                        <ShoppingCart size={20} />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
