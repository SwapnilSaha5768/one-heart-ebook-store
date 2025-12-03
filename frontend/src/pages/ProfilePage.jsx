// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { getMe, updateMe } from "../api/authApi";
import { getOrdersApi } from "../api/ordersApi";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../api/addressesApi";
import { User, MapPin, Package, Settings, LogOut, Plus, Edit2, Trash2, CheckCircle, AlertCircle, ShoppingBag, Calendar, ChevronRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile"); 

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");

  // address form state
  const emptyAddress = {
    id: null,
    full_name: "",
    line1: "",
    line2: "",
    city: "",
    postal_code: "",
    country: "Bangladesh",
    is_default: false,
  };

  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [meData, addrData, ordersData] = await Promise.all([
          getMe(),
          fetchAddresses(),
          getOrdersApi(),
        ]);

        setUser(meData.user);
        setProfile(meData.profile);
        setOrders(ordersData.data?.results || ordersData.data || []);

        setFirstName(meData.user.first_name || "");
        setLastName(meData.user.last_name || "");
        setPhone(meData.profile.phone || "");
        setPreferredLanguage(meData.profile.preferred_language || "en");

        let addrList = [];
        if (Array.isArray(addrData)) {
          addrList = addrData;
        } else if (addrData && Array.isArray(addrData.results)) {
          addrList = addrData.results;
        } else if (addrData && Array.isArray(addrData.addresses)) {
          addrList = addrData.addresses;
        }

        setAddresses(addrList);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);



  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        phone,
        preferred_language: preferredLanguage,
      };
      const data = await updateMe(payload);
      setUser(data.user);
      setProfile(data.profile);
      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const startCreateAddress = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setSuccess("");
    setError("");
    setShowAddressForm(true);
  };

  const startEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      id: address.id,
      full_name: address.full_name || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      postal_code: address.postal_code || "",
      country: address.country || "Bangladesh",
      is_default: address.is_default || false,
    });
    setSuccess("");
    setError("");
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        full_name: addressForm.full_name,
        line1: addressForm.line1,
        line2: addressForm.line2,
        city: addressForm.city,
        postal_code: addressForm.postal_code,
        country: addressForm.country,
        is_default: addressForm.is_default,
      };

      if (editingAddressId) {
        const updated = await updateAddress(editingAddressId, payload);
        setAddresses((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a)),
        );
        setSuccess("Address updated successfully.");
      } else {
        const created = await createAddress(payload);
        setAddresses((prev) => [...prev, created]);
        setSuccess("Address added successfully.");
      }

      setAddressForm(emptyAddress);
      setEditingAddressId(null);
      setShowAddressForm(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Address deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to delete address:", err);
      setError("Failed to delete address.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-red"></div>
      </div>
    );
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-gray-900">My Account</h1>
          <p className="text-gray-500 mt-1">Manage your profile, orders, and preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-brand-red font-bold text-xl">
                  {user?.first_name?.[0] || user?.username?.[0] || "U"}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 truncate">{user?.username || "User"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                <SidebarItem id="profile" icon={User} label="Profile" />
                <SidebarItem id="addresses" icon={MapPin} label="Addresses" />
                <SidebarItem id="orders" icon={Package} label="My Orders" />
                <SidebarItem id="settings" icon={Settings} label="Settings" />
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">

            {/* Notifications */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
                <CheckCircle size={18} />
                {success}
              </div>
            )}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                </div>
                <div className="p-6">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <input
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Preferred Language</label>
                        <select
                          value={preferredLanguage}
                          onChange={(e) => setPreferredLanguage(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all"
                        >
                          <option value="en">English</option>
                          <option value="bn">Bangla</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-2 bg-brand-red text-white font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:opacity-70"
                      >
                        {savingProfile ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold font-serif text-gray-900">My Addresses</h2>
                  <button
                    onClick={startCreateAddress}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                </div>

                {showAddressForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
                    <h3 className="text-lg font-bold mb-4">{editingAddressId ? "Edit Address" : "Add New Address"}</h3>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          type="text"
                          name="full_name"
                          value={addressForm.full_name}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Address Line 1</label>
                        <input
                          type="text"
                          name="line1"
                          value={addressForm.line1}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          name="line2"
                          value={addressForm.line2}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            name="city"
                            value={addressForm.city}
                            onChange={handleAddressChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Postal Code</label>
                          <input
                            type="text"
                            name="postal_code"
                            value={addressForm.postal_code}
                            onChange={handleAddressChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_default"
                          checked={addressForm.is_default}
                          onChange={handleAddressChange}
                          id="is_default"
                          className="rounded text-brand-red focus:ring-brand-red"
                        />
                        <label htmlFor="is_default" className="text-sm text-gray-700">Set as default address</label>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="px-6 py-2 bg-brand-red text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                        >
                          {savingAddress ? "Saving..." : "Save Address"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative group hover:shadow-md transition-shadow">
                      {addr.is_default && (
                        <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{addr.full_name}</h4>
                          <p className="text-sm text-gray-500">{addr.country}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 mb-6">
                        <p>{addr.line1}</p>
                        {addr.line2 && <p>{addr.line2}</p>}
                        <p>{addr.city}, {addr.postal_code}</p>
                      </div>
                      <div className="flex gap-3 border-t border-gray-50 pt-4">
                        <button
                          onClick={() => startEditAddress(addr)}
                          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-red transition-colors"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        {confirmDeleteId === addr.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-600 font-medium">Are you sure?</span>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-xs font-bold text-red-600 hover:underline"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(addr.id)}
                            className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!showAddressForm && addresses.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                      <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No addresses found</p>
                      <button onClick={startCreateAddress} className="text-brand-red hover:underline mt-2 text-sm">Add your first address</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold font-serif text-gray-900">My Orders</h2>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-brand-red/10 rounded-lg text-brand-red">
                                <ShoppingBag size={20} />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">Order #{order.id}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Calendar size={14} />
                                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
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
                            </div>
                          </div>

                          <div className="border-t border-gray-50 pt-4">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                {order.items?.length || 0} items
                              </div>
                              {order.status === "paid" && (
                                <button
                                  onClick={() => navigate("/library")}
                                  className="flex items-center gap-1 text-sm font-medium text-brand-red hover:text-red-700"
                                >
                                  Go to Library <ChevronRight size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Package size={64} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-6">You haven't placed any orders yet. Start shopping now!</p>
                    <button onClick={() => navigate("/books")} className="px-6 py-2 bg-brand-red text-white font-medium rounded-lg hover:bg-red-600 transition-colors">
                      Browse Books
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Account Settings</h2>
                <p> Coming Soon..</p>
                {/* <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-gray-50">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive updates about your orders and promotions</p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                      <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button className="text-red-500 font-medium text-sm hover:underline">Delete Account</button>
                  </div>
                </div> */}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;