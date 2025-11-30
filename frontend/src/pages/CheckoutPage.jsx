import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadCart } from "../features/cart/cartSlice";
import { getAddressesApi, createAddressApi } from "../api/addressesApi";
import { applyCouponApi } from "../api/couponsApi";
import { checkoutApi } from "../api/ordersApi";
import { CreditCard, MapPin, Tag, Check, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function CheckoutPage() {
  const [payerNumber, setPayerNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [billingAddressId, setBillingAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("manual_bkash");
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [error, setError] = useState("");

  // Address Creation State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    line1: "",
    city: "",
    postal_code: "",
    country: "Bangladesh",
    phone: ""
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(loadCart());
    loadAddresses();
  }, [dispatch, isAuthenticated, navigate]);

  const loadAddresses = async () => {
    try {
      const data = await getAddressesApi();
      const list = data.results ?? data;
      setAddresses(list);

      if (Array.isArray(list) && list.length > 0 && !billingAddressId) {
        setBillingAddressId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createAddressApi(newAddress);
      await loadAddresses();
      setIsAddingAddress(false);
      setBillingAddressId(res.id); // Select the new address
      setNewAddress({ full_name: "", line1: "", city: "", postal_code: "", country: "Bangladesh", phone: "" });
    } catch (err) {
      console.error(err);
      setError("Failed to create address. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce(
      (sum, item) => sum + parseFloat(item.subtotal),
      0
    );
  }, [cart]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setError("");
    try {
      const res = await applyCouponApi(couponCode, cartTotal);
      setCouponInfo(res.data);
    } catch (err) {
      setCouponInfo(null);
      setError(err.response?.data?.detail || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        billing_address_id: billingAddressId,
        payment_method: paymentMethod,
        payer_number: payerNumber,
        transaction_id: transactionId,
        customer_note: customerNote,
      };
      if (couponCode) {
        payload.coupon_code = couponCode;
      }
      const res = await checkoutApi(payload);
      navigate("/library");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven't added any books yet.</p>
          <button
            onClick={() => navigate('/books')}
            className="bg-brand-red text-white px-8 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  const finalAmount = Number(couponInfo?.final_amount ?? cartTotal) || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-8">

            {/* Billing Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Billing Address</h2>
                </div>
                {!isAddingAddress && addresses.length > 0 && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="text-sm text-brand-red font-medium hover:underline"
                  >
                    + Add New
                  </button>
                )}
              </div>
              {
                isAddingAddress ? (
                  <form onSubmit={handleCreateAddress} className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                    <h3 className="font-bold text-gray-900">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full rounded-lg border-gray-300 focus:border-brand-red focus:ring-brand-red"
                        value={newAddress.full_name}
                        onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        className="w-full rounded-lg border-gray-300 focus:border-brand-red focus:ring-brand-red"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        className="w-full rounded-lg border-gray-300 focus:border-brand-red focus:ring-brand-red md:col-span-2"
                        value={newAddress.line1}
                        onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full rounded-lg border-gray-300 focus:border-brand-red focus:ring-brand-red"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        className="w-full rounded-lg border-gray-300 focus:border-brand-red focus:ring-brand-red"
                        value={newAddress.postal_code}
                        onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        className="w-full rounded-lg border-gray-300 focus:border-brand-red focus:ring-brand-red"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-brand-red text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        {loading ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {!Array.isArray(addresses) || addresses.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 mb-4">No address found.</p>
                        <button
                          onClick={() => setIsAddingAddress(true)}
                          className="text-brand-red font-medium hover:underline"
                        >
                          Add New Address
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {addresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${billingAddressId === addr.id
                              ? 'border-brand-red bg-red-50/10'
                              : 'border-gray-100 hover:border-gray-200'
                              }`}
                          >
                            <input
                              type="radio"
                              name="address"
                              value={addr.id}
                              checked={billingAddressId === addr.id}
                              onChange={() => setBillingAddressId(addr.id)}
                              className="absolute top-4 right-4 text-brand-red focus:ring-brand-red"
                            />
                            <span className="font-bold text-gray-900 mb-1">{addr.full_name}</span>
                            <span className="text-sm text-gray-500">{addr.address_line1}</span>
                            <span className="text-sm text-gray-500">{addr.city}, {addr.country}</span>
                            <span className="text-xs text-gray-400 mt-2">{addr.phone}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </>
                )
              }
            </div >

            {/* Payment Method */}
            < div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8" >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { id: 'manual_bkash', name: 'bKash', color: 'bg-pink-500' },
                  { id: 'manual_nagad', name: 'Nagad', color: 'bg-orange-500' }
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id
                      ? 'border-brand-red bg-red-50/10'
                      : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4 text-brand-red focus:ring-brand-red"
                    />
                    <span className={`w-8 h-8 rounded-full ${method.color} text-white flex items-center justify-center text-xs font-bold mr-3`}>
                      {method.name[0]}
                    </span>
                    <span className="font-medium text-gray-900">{method.name} Payment</span>
                  </label>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Please send <strong>{finalAmount.toFixed(2)} BDT</strong> to:</p>
                    <p className="font-mono bg-white inline-block px-2 py-1 rounded border border-gray-200 mb-1">01XXXXXXXXX (bKash)</p>
                    <br />
                    <p className="font-mono bg-white inline-block px-2 py-1 rounded border border-gray-200">01YYYYYYYYY (Nagad)</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sender Number</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-300 focus:border-brand-red focus:ring-brand-red"
                      placeholder="01XXXXXXXXX"
                      value={payerNumber}
                      onChange={(e) => setPayerNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-300 focus:border-brand-red focus:ring-brand-red"
                      placeholder="e.g. 8XKL29..."
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div >

            {/* Note */}
            < div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8" >
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Note (Optional)</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border-gray-300 focus:border-brand-red focus:ring-brand-red"
                placeholder="Any special instructions..."
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
              />
            </div >
          </div >

          {/* Right Column: Summary */}
          < div className="lg:col-span-4" >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/*<div className="w-16 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {item.book?.cover_image ? (
                        <img src={item.book.cover_image} alt={item.book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                      )}
                    </div>*/}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">{item.book?.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-brand-red mt-1">{item.subtotal} BDT</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{cartTotal.toFixed(2)} BDT</span>
                </div>

                {couponInfo ? (
                  <div className="flex justify-between text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <span className="flex items-center gap-2"><Tag size={14} /> Discount</span>
                    <span>-{couponInfo.discount_amount} BDT</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      className="flex-1 rounded-lg border-gray-300 text-sm focus:border-brand-red focus:ring-brand-red"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode}
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                      {couponLoading ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                    </button>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">Total</span>
                  <span className="font-bold text-brand-red text-xl">{finalAmount.toFixed(2)} BDT</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full mt-6 bg-brand-red text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div >
        </div >
      </div >
    </div >
  );
}
