import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import { Mail, Phone, MapPin, Send, ChevronDown, ChevronUp, Facebook, Youtube } from "lucide-react";

const ContactUs = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState(null);

  const faqs = [
    {
      question: "How do I download my ebooks?",
      answer:
        "Once your purchase is complete, you can instantly download your ebooks from your 'Library' section in your profile. We also send a download link to your registered email address.",
    },
    {
      question: "What formats are the ebooks available in?",
      answer:
        "Most of our ebooks are available in PDF, EPUB, and MOBI formats, ensuring compatibility with all major e-readers, tablets, and smartphones.",
    },
    {
      question: "Can I refund a purchase?",
      answer:
        "We offer a 7-day money-back guarantee if you're not satisfied with your purchase or if there are technical issues with the file. Please contact our support team for assistance.",
    },
    {
      question: "Do you offer coupon cards?",
      answer:
        "Yes! You can purchase digital coupon cards of various denominations from our store. They make the perfect gift for the book lovers in your life.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    // Basic frontend validation
    if (!form.first_name || !form.email || !form.message) {
      setErrorMsg("Please fill your name, email and message.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      };


      await axiosClient.post("/contact/", payload);

      setSuccessMsg("Thanks — your message has been sent. We'll reply within 24 hours.");
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        subject: "General Inquiry",
        message: "",
      });
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.detail || "Unable to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)]">
      {/* Hero Section */}
      <section className="relative py-20 px-6 md:px-12 lg:px-24 bg-[var(--color-brand-dark)] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Get in Touch</h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Have a question, suggestion, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand-red)]/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-6 md:px-12 lg:px-24 -mt-10">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Contact Info (Left) */}
            <div className="bg-[var(--color-brand-dark)] text-white p-10 md:p-16 flex flex-col justify-between relative overflow-hidden">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-8">Contact Information</h2>
                <p className="text-gray-300 mb-12 leading-relaxed">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[var(--color-brand-red)]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">Phone</h4>
                      <p className="text-gray-400">+8801751451330</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[var(--color-brand-red)]">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">Email</h4>
                      <p className="text-gray-400">contact@oneheartbd.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[var(--color-brand-red)]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg mb-1">Office</h4>
                      <p className="text-gray-400">
                        Road 1, Bonolota Banijjik Area, Sopura, Rajshahi, Bangladesh
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-white/10">
                <div className="flex gap-4">
                  <a
                    href="https://www.facebook.com/profile.php?id=61567033232293"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[var(--color-brand-dark)] transition-colors cursor-pointer"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="https://www.youtube.com/@OneHeart-BD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[var(--color-brand-dark)] transition-colors cursor-pointer"
                  >
                    <Youtube size={20} />
                  </a>
                  <a
                    href="https://wa.me/8801751451330"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[var(--color-brand-dark)] transition-colors cursor-pointer"
                  >
                    <Phone size={20} />
                  </a>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--color-brand-red)]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            </div>

            {/* Contact Form (Right) */}
            <div className="p-10 md:p-16 bg-white">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <input
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[var(--color-brand-red)] focus:ring-2 focus:ring-[var(--color-brand-red)]/20 outline-none transition-all"
                      placeholder="Given Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[var(--color-brand-red)] focus:ring-2 focus:ring-[var(--color-brand-red)]/20 outline-none transition-all"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[var(--color-brand-red)] focus:ring-2 focus:ring-[var(--color-brand-red)]/20 outline-none transition-all"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[var(--color-brand-red)] focus:ring-2 focus:ring-[var(--color-brand-red)]/20 outline-none transition-all text-gray-600"
                  >
                    <option>General Inquiry</option>
                    <option>Support Request</option>
                    <option>Partnership Opportunity</option>
                    <option>Feedback</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[var(--color-brand-red)] focus:ring-2 focus:ring-[var(--color-brand-red)]/20 outline-none transition-all resize-none"
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>

                {errorMsg && <div className="text-red-600 text-sm">{errorMsg}</div>}
                {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[var(--color-brand-red)] text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                >
                  {loading ? "Sending..." : "Send Message"}
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Find quick answers to common questions about our store.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 ${activeAccordion === index ? "bg-[var(--color-brand-bg)] border-[var(--color-brand-red)]/20 shadow-sm" : "hover:border-gray-300"
                  }`}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => toggleAccordion(index)}
                >
                  <span className={`font-medium text-lg ${activeAccordion === index ? "text-[var(--color-brand-red)]" : "text-[var(--color-brand-dark)]"}`}>
                    {faq.question}
                  </span>
                  {activeAccordion === index ? (
                    <ChevronUp size={20} className="text-[var(--color-brand-red)]" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeAccordion === index ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};



export default ContactUs;
