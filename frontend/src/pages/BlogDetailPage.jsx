import { useEffect, useState } from "react";
import { fetchPostById } from "../api/blogApi";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft, Clock } from "lucide-react";

function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPostById(id);
        setPost(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
        <p className="text-gray-500 mb-6">The article you are looking for might have been removed or is temporarily unavailable.</p>
        <Link to="/blog" className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-red-600 transition-colors">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">

      {/* Hero / Header */}
      <div className="bg-gray-50 border-b border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/blog" className="inline-flex items-center text-gray-500 hover:text-brand-red mb-8 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Blog
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm">
            {post.created_at && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-brand-red" />
                {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            )}
            {post.author_name && (
              <div className="flex items-center gap-2">
                <User size={16} className="text-brand-red" />
                {post.author_name}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-brand-red" />
              5 min read
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 mb-12">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl shadow-xl"
          />
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6">
        <div
          className="prose prose-lg prose-red max-w-none prose-headings:font-serif prose-headings:font-bold prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></div>

        {/* Author Bio / Footer (Optional) */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
          <div className="text-gray-500 text-sm">
            Share this article:
            {/* Social Share Icons Placeholder */}
            <div className="flex gap-4 mt-2">
              <button className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors">F</button>
              <button className="w-8 h-8 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center hover:bg-pink-200 transition-colors">I</button>
              <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-100 transition-colors">L</button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default BlogDetailPage;