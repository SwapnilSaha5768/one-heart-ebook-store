import { useEffect, useState } from "react";
import { fetchPostById } from "../api/blogApi";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin } from "lucide-react";

function BlogDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Post not found</h2>
        <p className="text-gray-500 mb-8 text-lg">The article you are looking for might have been removed or is temporarily unavailable.</p>
        <Link to="/blog" className="px-8 py-3 bg-brand-red text-white rounded-full hover:bg-red-700 transition-all shadow-lg hover:shadow-xl">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20 relative">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-brand-red z-50 transition-all duration-100" style={{ width: `${scrollProgress * 100}%` }} />

      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <Link to="/blog" className="inline-flex items-center text-gray-500 hover:text-brand-red mb-8 transition-colors group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Blog</span>
        </Link>

        <h1 className="text-4xl md:text-6xl font-bold font-serif text-gray-900 mb-8 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm md:text-base border-t border-b border-gray-100 py-6">
          {post.author_name && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-brand-red">
                <User size={16} />
              </div>
              <span className="font-medium text-gray-900">{post.author_name}</span>
            </div>
          )}
          <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></div>
          {post.created_at && (
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              <span>{new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          )}
          <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            <span>5 min read</span>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-12">
          <div className="relative h-[400px] overflow-hidden rounded-2xl shadow-lg">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6">
        <div
          className="prose prose-lg md:prose-xl prose-red max-w-none 
          prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900 
          prose-p:text-gray-600 prose-p:leading-relaxed 
          prose-a:text-brand-red prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-10
          prose-blockquote:border-l-4 prose-blockquote:border-brand-red prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic"
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></div>

        {/* Footer / Share */}
        <div className="mt-20 pt-10 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-900 font-bold font-serif text-lg">Share this article</span>
              <div className="h-px w-12 bg-gray-200"></div>
            </div>

            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1">
                <Facebook size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all duration-300 transform hover:-translate-y-1">
                <Twitter size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1">
                <Linkedin size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default BlogDetailPage;