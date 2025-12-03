import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ = () => {
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

    return (
        <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-dark)]">
            {/* Hero Section */}
            <section className="relative py-20 px-6 md:px-12 lg:px-24 bg-[var(--color-brand-dark)] text-white overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Frequently Asked Questions</h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light">
                        Find quick answers to common questions about our store.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand-red)]/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
                <div className="max-w-3xl mx-auto">
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

export default FAQ;
