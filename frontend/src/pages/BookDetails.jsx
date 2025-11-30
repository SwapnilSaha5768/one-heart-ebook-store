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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Cover Image */}
        <div className="flex-shrink-0">
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-64 shadow-lg rounded"
          />
        </div>

        {/* Info Section */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>

          <p className="text-gray-700 mb-4">{book.description}</p>

          <div className="text-xl font-semibold mb-4">
            {book.effective_price} {book.currency}
          </div>

          {/* AUTHORS */}
          <h2 className="font-semibold text-lg mt-4">Authors</h2>
          <ul className="text-gray-700 mb-4">
            {book.authors.map((a) => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 transition"
          >
            Add to Cart
          </button>

          {cart.error && (
            <p className="text-red-500 text-sm mt-2">{cart.error}</p>
          )}
        </div>
      </div>

      {/* Categories + Tags */}
      <div className="mt-10">
        <h2 className="font-bold text-xl mb-2">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {book.categories.map((cat) => (
            <span
              key={cat.id}
              className="bg-gray-200 px-3 py-1 rounded text-sm"
            >
              {cat.name}
            </span>
          ))}
        </div>

        <h2 className="font-bold text-xl mt-6 mb-2">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {book.tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-blue-100 px-3 py-1 rounded text-sm text-blue-700"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
