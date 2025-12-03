import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";

export default function BookDetails() {
  const { slug } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/books/${slug}/`)
      .then((res) => res.json())
      .then((data) => {
        setBook(data);
        setLoading(false);
      });
  }, [slug]);

  const handleAddToCart = () => {
    dispatch(addToCart({ bookId: book.id, quantity: 1 }));
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!book) return <p className="p-6">Book not found</p>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Cover Image */}
            <div className="md:w-1/3 lg:w-1/4 bg-gray-100 flex items-center justify-center p-8">
              <div className="relative w-full max-w-[250px] shadow-2xl rounded-lg overflow-hidden transform transition-transform hover:scale-105 duration-500">
                {book.cover_image ? (
                  <img
                    src={book.cover_image}
                    alt={book.title}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-200 flex items-center justify-center text-gray-400">
                    No Cover
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 p-8 md:p-12">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {book.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="bg-red-50 text-brand-red px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mb-2 leading-tight">
                    {book.title}
                  </h1>

                  <p className="text-lg text-gray-600 mb-6 font-medium">
                    by {book.authors.map((a) => a.name).join(", ")}
                  </p>

                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-3xl font-bold text-brand-red">
                      {book.effective_price} {book.currency}
                    </span>
                    {/* Placeholder for rating if available */}
                    <div className="flex items-center gap-1 text-yellow-400">
                      {/* Stars can be added here */}
                    </div>
                  </div>

                  <div className="prose prose-lg text-gray-600 mb-8 max-w-none">
                    <p>{book.description}</p>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
                  <button
                    onClick={handleAddToCart}
                    className="w-full sm:w-auto px-8 py-4 bg-brand-red text-white rounded-lg font-bold text-lg shadow-lg hover:bg-red-700 transition-all transform hover:-translate-y-1"
                  >
                    Add to Cart
                  </button>
                  {cart.error && (
                    <p className="text-red-500 text-sm">{cart.error}</p>
                  )}
                </div>

                {book.tags && book.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {book.tags.map((tag) => (
                        <span key={tag.id} className="text-gray-500 bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors cursor-default">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}