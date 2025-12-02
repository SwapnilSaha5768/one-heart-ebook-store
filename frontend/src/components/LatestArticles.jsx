import { useEffect, useState } from "react";
import { fetchPosts } from "../api/blogApi";
import { Link } from "react-router-dom";

export default function LatestArticles() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchPosts();
                if (Array.isArray(data)) {
                    setPosts(data.slice(0, 3));
                } else if (Array.isArray(data.results)) {
                    setPosts(data.results.slice(0, 3));
                }
            } catch (err) {
                console.error("Failed to load articles", err);
            }
        };
        load();
    }, []);

    if (posts.length === 0) return null;

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-4xl font-bold font-serif text-center mb-12 text-brand-dark">
                    Our Latest Articles
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <div key={post.id} className="group">
                            <div className="rounded-xl overflow-hidden mb-4 shadow-sm h-56">
                                {post.featured_image ? (
                                    <img
                                        src={post.featured_image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold font-serif mb-3 text-gray-800 group-hover:text-brand-red transition-colors">
                                {post.title}
                            </h3>

                            <p className="text-gray-600 mb-4 line-clamp-3">
                                {post.summary || post.content?.substring(0, 100) + "..."}
                            </p>

                            <Link
                                to={`/blog/${post.id}`}
                                className="text-brand-red font-semibold hover:underline"
                            >
                                Read More
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}