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
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-gray-900">My Library</h1>
        <p className="text-gray-500 mt-1">Manage and download your purchased ebooks.</p>
      </div>

      {Array.isArray(items) && items.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((pi) => {
            const isReady = pi.is_active && pi.payment_status === "success";
            return (
              <div
                key={pi.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                  {pi.book?.cover_image ? (
                    <img
                      src={pi.book.cover_image}
                      alt={pi.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      No Cover
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${isReady ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {isReady ? "Ready" : pi.payment_status}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="font-bold text-gray-900 mb-1 line-clamp-1" title={pi.book?.title}>
                    {pi.book?.title || "Unknown Book"}
                  </h2>

                  <div className="mt-auto pt-4 space-y-3">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Downloads</span>
                      <span>{pi.downloads_count} {pi.download_limit ? `/ ${pi.download_limit}` : ""}</span>
                    </div>

                    <button
                      onClick={() => isReady && handleDownload(pi.id)}
                      disabled={!isReady || downloadingId === pi.id}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${isReady
                        ? "bg-brand-red text-white hover:bg-red-700 shadow-sm hover:shadow"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      {downloadingId === pi.id
                        ? "Preparing..."
                        : isReady
                          ? "Download Ebook"
                          : "Processing..."}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">You have no purchased ebooks yet.</p>
          <button onClick={() => navigate("/books")} className="text-brand-red font-medium hover:underline">
            Browse Books
          </button>
        </div>
      )}
    </div>
  );
}