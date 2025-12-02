import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { addToCart } from "../features/cart/cartSlice";

export default function MostSelling() {
    const { items: books } = useSelector((state) => state.books);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // For demo, just take the first 3 books or specific ones
    const displayBooks = books.slice(0, 3);

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-4xl font-bold font-serif text-center mb-12 text-brand-dark">
                    Our Most Selling Books
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {displayBooks.map((book) => (
                        <div key={book.id} className="group cursor-pointer" onClick={() => navigate(`/books/${book.slug}`)}>
                            <div className="bg-[#FDFBF7] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center h-full border border-gray-100">
                                <div className="relative mb-6 w-48 h-64 shadow-lg rounded-md overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
                                    {book.cover_image ? (
                                        <img
                                            src={book.cover_image}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                            No Cover
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-1 mb-2 text-brand-red">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill="currentColor" className="text-brand-red" />
                                    ))}
                                </div>

                                <h3 className="text-xl font-bold font-serif mb-2 text-gray-800 line-clamp-2">
                                    {book.title}
                                </h3>

                                <p className="text-brand-red font-bold text-lg mb-4">
                                    {book.effective_price || book.price} {book.currency || "BDT"}
                                </p>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(addToCart({ bookId: book.id }));
                                    }}
                                    className="mt-auto bg-brand-red text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors w-full max-w-[200px]"
                                >
                                    Add To Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}