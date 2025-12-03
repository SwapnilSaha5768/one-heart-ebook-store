import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { LayoutDashboard, BookOpen, FileText, ShoppingBag, Users, Settings, Calendar, Plus, Edit2, Trash2, X, CheckSquare, Square } from "lucide-react";
import {
    getDashboardStats, getAdminOrders, updateOrderStatus,
    getAdminBooks, createBook, updateBook, deleteBook,
    getAdminBlogs, createBlog, updateBlog, deleteBlog,
    getAdminUsers, getAuthors, getCategories, getTags, createAuthor
} from "../api/adminApi";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState("overview");

    const [stats, setStats] = useState({ total_orders: 0, total_sales: 0, active_users: 0 });
    const [orders, setOrders] = useState([]);
    const [books, setBooks] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [users, setUsers] = useState([]);

    // Metadata options
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);

    const [loading, setLoading] = useState(false);
    const [updatingOrder, setUpdatingOrder] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null); // 'book' or 'blog'
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    // New Author State
    const [newAuthorName, setNewAuthorName] = useState("");
    const [addingAuthor, setAddingAuthor] = useState(false);

    useEffect(() => {
        if (user && !user.is_staff && !user.is_superuser) {
            navigate("/");
        }
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === "overview") {
                const data = await getDashboardStats();
                setStats(data);
            } else if (activeTab === "orders") {
                const data = await getAdminOrders();
                setOrders(data.results || data);
            } else if (activeTab === "books") {
                const [booksData, authorsData, catsData, tagsData] = await Promise.all([
                    getAdminBooks(),
                    getAuthors(),
                    getCategories(),
                    getTags()
                ]);
                setBooks(booksData.results || booksData);
                setAuthors(authorsData.results || authorsData);
                setCategories(catsData.results || catsData);
                setTags(tagsData.results || tagsData);
            } else if (activeTab === "blogs") {
                const data = await getAdminBlogs();
                setBlogs(data.results || data);
            } else if (activeTab === "users") {
                const data = await getAdminUsers();
                setUsers(data.results || data);
            }
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && (user.is_staff || user.is_superuser)) {
            fetchData();
        }
    }, [activeTab, user]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setUpdatingOrder(orderId);
            const updatedOrder = await updateOrderStatus(orderId, newStatus);
            setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
        } catch (error) {
            console.error("Failed to update order status:", error);
            alert("Failed to update status");
        } finally {
            setUpdatingOrder(null);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            if (type === 'book') {
                await deleteBook(id);
                setBooks(prev => prev.filter(b => b.id !== id));
            } else if (type === 'blog') {
                await deleteBlog(id);
                setBlogs(prev => prev.filter(b => b.id !== id));
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete item");
        }
    };

    const openModal = (type, item = null) => {
        setModalType(type);
        setEditingItem(item);
        setNewAuthorName(""); // Reset new author input

        // For editing, we need to extract IDs from objects if they are populated
        let initialData = item || {};
        if (item && type === 'book') {
            initialData = {
                ...item,
                authors: item.authors?.map(a => typeof a === 'object' ? a.id : a) || [],
                categories: item.categories?.map(c => typeof c === 'object' ? c.id : c) || [],
                tags: item.tags?.map(t => typeof t === 'object' ? t.id : t) || [],
            };
        }

        setFormData(initialData);
        setShowModal(true);
    };

    const handleAddAuthor = async () => {
        if (!newAuthorName.trim()) return;
        try {
            setAddingAuthor(true);
            const newAuthor = await createAuthor({ name: newAuthorName });
            setAuthors(prev => [...prev, newAuthor]); // Add to list

            // Automatically select the new author
            setFormData(prev => ({
                ...prev,
                authors: [...(prev.authors || []), newAuthor.id]
            }));

            setNewAuthorName("");
            alert("Author added successfully!");
        } catch (error) {
            console.error("Failed to add author:", error);
            alert("Failed to add author.");
        } finally {
            setAddingAuthor(false);
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();

            // Handle basic fields
            const basicFields = ['title', 'slug', 'price', 'description', 'summary', 'content', 'is_published'];
            basicFields.forEach(field => {
                if (formData[field] !== undefined && formData[field] !== null) {
                    data.append(field, formData[field]);
                }
            });

            // Handle ManyToMany fields (authors, categories, tags)
            ['authors', 'categories', 'tags'].forEach(field => {
                if (Array.isArray(formData[field])) {
                    formData[field].forEach(id => {
                        data.append(field, id);
                    });
                }
            });

            // Handle Files
            if (formData.cover_image instanceof File) {
                data.append('cover_image', formData.cover_image);
            }
            if (formData.featured_image instanceof File) {
                data.append('featured_image', formData.featured_image);
            }

            if (modalType === 'book') {
                if (editingItem) {
                    await updateBook(editingItem.id, data);
                } else {
                    await createBook(data);
                }
            } else if (modalType === 'blog') {
                if (editingItem) {
                    await updateBlog(editingItem.id, data);
                } else {
                    await createBlog(data);
                }
            }
            setShowModal(false);
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Save failed:", error);
            if (error.response) {
                alert(`Failed: ${JSON.stringify(error.response.data)}`);
            } else {
                alert("Failed to save item.");
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const handleCheckboxChange = (field, id) => {
        setFormData(prev => {
            const currentIds = prev[field] || [];
            if (currentIds.includes(id)) {
                return { ...prev, [field]: currentIds.filter(i => i !== id) };
            } else {
                return { ...prev, [field]: [...currentIds, id] };
            }
        });
    };

    if (!user || (!user.is_staff && !user.is_superuser)) {
        return null;
    }

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === id
                    ? "bg-brand-red text-white shadow-md"
                    : "text-gray-600 hover:bg-red-50 hover:text-brand-red"
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-serif text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage books, orders, blogs, and users.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <nav className="space-y-2">
                                <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
                                <SidebarItem id="orders" icon={ShoppingBag} label="Orders" />
                                <SidebarItem id="books" icon={BookOpen} label="Books" />
                                <SidebarItem id="blogs" icon={FileText} label="Blogs" />
                                <SidebarItem id="users" icon={Users} label="Users" />
                                <SidebarItem id="settings" icon={Settings} label="Settings" />
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-red"></div>
                                </div>
                            ) : (
                                <>
                                    {activeTab === "overview" && (
                                        <div>
                                            <h2 className="text-xl font-bold mb-4">Overview</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                                    <h3 className="text-blue-800 font-bold text-lg">Total Orders</h3>
                                                    <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total_orders}</p>
                                                </div>
                                                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                                                    <h3 className="text-green-800 font-bold text-lg">Total Sales</h3>
                                                    <p className="text-3xl font-bold text-green-900 mt-2">৳{stats.total_sales}</p>
                                                </div>
                                                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                                    <h3 className="text-purple-800 font-bold text-lg">Active Users</h3>
                                                    <p className="text-3xl font-bold text-purple-900 mt-2">{stats.active_users}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "orders" && (
                                        <div>
                                            <h2 className="text-xl font-bold mb-4">Manage Orders</h2>
                                            <div className="space-y-4">
                                                {orders.map((order) => (
                                                    <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow p-4">
                                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                                            <div>
                                                                <h4 className="font-bold text-gray-900">Order #{order.order_number || order.id}</h4>
                                                                <p className="text-sm text-gray-500">User: {order.user?.username || "Unknown"}</p>
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <Calendar size={14} />
                                                                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === "paid" ? "bg-green-100 text-green-700" :
                                                                    order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                                        "bg-gray-100 text-gray-700"
                                                                    }`}>
                                                                    {order.status?.toUpperCase() || "PENDING"}
                                                                </span>
                                                                <span className="font-bold text-lg text-gray-900">
                                                                    ৳{order.total_amount}
                                                                </span>

                                                                <select
                                                                    value={order.status}
                                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                                    disabled={updatingOrder === order.id}
                                                                    className="ml-4 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-brand-red"
                                                                >
                                                                    <option value="pending">Pending</option>
                                                                    <option value="paid">Paid</option>
                                                                    <option value="failed">Failed</option>
                                                                    <option value="cancelled">Cancelled</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {orders.length === 0 && <p className="text-gray-500">No orders found.</p>}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "books" && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">Manage Books</h2>
                                                <button onClick={() => openModal('book')} className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-600">
                                                    <Plus size={18} /> Add Book
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {books.map((book) => (
                                                    <div key={book.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100">
                                                        <img src={book.cover_image} alt={book.title} className="w-12 h-16 object-cover rounded" />
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-900">{book.title}</h4>
                                                            <p className="text-sm text-gray-500">
                                                                {book.authors?.map(a => typeof a === 'object' ? a.name : a).join(', ')}
                                                            </p>
                                                        </div>
                                                        <div className="font-bold text-gray-900 mr-4">৳{book.price}</div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => openModal('book', book)} className="p-2 text-gray-600 hover:text-brand-red bg-gray-50 rounded-lg">
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button onClick={() => handleDelete('book', book.id)} className="p-2 text-red-500 hover:text-red-700 bg-red-50 rounded-lg">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {books.length === 0 && <p className="text-gray-500">No books found.</p>}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "blogs" && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-bold">Manage Blogs</h2>
                                                <button onClick={() => openModal('blog')} className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-red-600">
                                                    <Plus size={18} /> Add Blog
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {blogs.map((blog) => (
                                                    <div key={blog.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{blog.title}</h4>
                                                            <p className="text-sm text-gray-500">{new Date(blog.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => openModal('blog', blog)} className="p-2 text-gray-600 hover:text-brand-red bg-gray-50 rounded-lg">
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button onClick={() => handleDelete('blog', blog.id)} className="p-2 text-red-500 hover:text-red-700 bg-red-50 rounded-lg">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {blogs.length === 0 && <p className="text-gray-500">No blogs found.</p>}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "users" && (
                                        <div>
                                            <h2 className="text-xl font-bold mb-4">Manage Users</h2>
                                            <div className="space-y-4">
                                                {users.map((u) => (
                                                    <div key={u.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{u.username}</h4>
                                                            <p className="text-sm text-gray-500">{u.email}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {u.is_superuser && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-bold">Superuser</span>}
                                                            {u.is_staff && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold">Staff</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                                {users.length === 0 && <p className="text-gray-500">No users found.</p>}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold">
                                    {editingItem ? 'Edit' : 'Add'} {modalType === 'book' ? 'Book' : 'Blog'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
                                {modalType === 'book' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                            <input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Unique)</label>
                                            <input type="text" name="slug" value={formData.slug || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                            <input type="number" name="price" value={formData.price || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
                                        </div>

                                        {/* Checkboxes for Authors */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Authors</label>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="Add new author..."
                                                    value={newAuthorName}
                                                    onChange={(e) => setNewAuthorName(e.target.value)}
                                                    className="flex-1 px-3 py-1 border rounded text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddAuthor}
                                                    disabled={addingAuthor}
                                                    className="px-3 py-1 bg-gray-800 text-white rounded text-sm hover:bg-gray-700"
                                                >
                                                    {addingAuthor ? "Adding..." : "Add"}
                                                </button>
                                            </div>
                                            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
                                                {authors.map(a => (
                                                    <label key={a.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={(formData.authors || []).includes(a.id)}
                                                            onChange={() => handleCheckboxChange('authors', a.id)}
                                                            className="rounded text-brand-red focus:ring-brand-red"
                                                        />
                                                        <span className="text-sm">{a.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Checkboxes for Categories */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                                            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
                                                {categories.map(c => (
                                                    <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={(formData.categories || []).includes(c.id)}
                                                            onChange={() => handleCheckboxChange('categories', c.id)}
                                                            className="rounded text-brand-red focus:ring-brand-red"
                                                        />
                                                        <span className="text-sm">{c.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Checkboxes for Tags */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
                                                {tags.map(t => (
                                                    <label key={t.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={(formData.tags || []).includes(t.id)}
                                                            onChange={() => handleCheckboxChange('tags', t.id)}
                                                            className="rounded text-brand-red focus:ring-brand-red"
                                                        />
                                                        <span className="text-sm">{t.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea name="description" value={formData.description || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" rows="3"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                                            {editingItem && editingItem.cover_image && (
                                                <div className="mb-2">
                                                    <img src={editingItem.cover_image} alt="Current Cover" className="h-20 w-auto rounded object-cover border" />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                name="cover_image"
                                                onChange={handleInputChange}
                                                className="w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-brand-red file:text-white
                          hover:file:bg-red-600
                          cursor-pointer"
                                            />
                                        </div>
                                    </>
                                )}

                                {modalType === 'blog' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                            <input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Unique)</label>
                                            <input type="text" name="slug" value={formData.slug || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                                            <textarea name="summary" value={formData.summary || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" rows="2"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                            <textarea name="content" value={formData.content || ''} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" rows="5"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                                            {editingItem && editingItem.featured_image && (
                                                <div className="mb-2">
                                                    <img src={editingItem.featured_image} alt="Current Image" className="h-20 w-auto rounded object-cover border" />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                name="featured_image"
                                                onChange={handleInputChange}
                                                className="w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-brand-red file:text-white
                          hover:file:bg-red-600
                          cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" name="is_published" checked={formData.is_published || false} onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))} />
                                            <label className="text-sm font-medium text-gray-700">Published</label>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-red-600">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
