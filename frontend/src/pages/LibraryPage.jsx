import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getLibraryApi, generateDownloadLinkApi } from "../api/libraryApi";
import { useNavigate } from "react-router-dom";

export default function LibraryPage() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getLibraryApi();
const list = res.data.results ?? res.data;

setItems(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load library");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, navigate]);

  const handleDownload = async (purchaseItemId) => {
  try {
    setDownloadingId(purchaseItemId);
    const res = await generateDownloadLinkApi(purchaseItemId);
    const url = res.data.download_url;   // 👈 we return this from backend
    if (url) {
      window.location.href = url;
    } else {
      alert("Download URL not returned from API");
    }
  } catch (err) {
    alert(err.response?.data?.detail || "Failed to start download");
  } finally {
    setDownloadingId(null);
  }
};


  if (loading) return <div className="p-6">Loading library...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Library</h1>
   {Array.isArray(items) && items.length > 0 ? (
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {items.map((pi) => {
      const isReady = pi.is_active && pi.payment_status === "success";
      return (
        <div
          key={pi.id}
          className="bg-white rounded-lg shadow p-4 flex flex-col"
        >
          {pi.book?.cover_image && (
            <img
              src={pi.book.cover_image}
              alt={pi.book.title}
              className="h-40 object-cover rounded mb-3"
            />
          )}
          <h2 className="font-semibold mb-1">
            {pi.book?.title || "Book"}
          </h2>
          <p className="text-xs text-slate-600 mb-1">
            Order status: {pi.order_status}
          </p>
          <p className="text-xs text-slate-600 mb-2">
            Payment status: {pi.payment_status}
          </p>
          <p className="text-xs text-slate-600 mb-2">
            Downloads: {pi.downloads_count}{" "}
            {pi.download_limit ? `/ ${pi.download_limit}` : "(no limit)"}
          </p>

          <button
            onClick={() => isReady && handleDownload(pi.id)}
            disabled={!isReady || downloadingId === pi.id}
            className={`mt-auto text-sm py-1.5 rounded ${
              isReady
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            {downloadingId === pi.id
              ? "Preparing..."
              : isReady
              ? "Download"
              : "Payment pending"}
          </button>
        </div>
      );
    })}
  </div>
) : (
  <p>You have no purchased ebooks yet.</p>
)}

    </div>
  );
}