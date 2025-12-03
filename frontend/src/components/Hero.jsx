import { Link } from "react-router-dom";
import heroImage from "../assets/bookHeroImage.png";

export default function Hero() {
    return (
        <section className="relative bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 z-10 order-2 lg:order-1">
                    <div className="relative inline-block">
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold font-serif text-brand-dark leading-tight">
                        Boost Your Skills <br />
                        Through <span className="text-brand-red">Reading</span>
                    </h1>
                    <p className="text-gray-600 text-lg max-w-lg leading-relaxed">
                        Enhance your knowledge and sharpen your abilities with our handpicked collection of books. Whether you're interested in personal development, leadership, or creative thinking, each title is designed to inspire and empower you.
                    </p>
                    <div className="pt-4">
                        <Link
                            to="/books"
                            className="inline-block bg-brand-red text-white font-semibold px-8 py-3 mr-4 rounded-md shadow-lg hover:bg-red-600 transition-colors uppercase tracking-wide"
                        >
                            Explore
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-block bg-brand-red text-white font-semibold px-8 py-3 rounded-md shadow-lg hover:bg-red-600 transition-colors uppercase tracking-wide"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>

                <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
                    <div className="relative w-full max-w-xl rounded-lg flex items-center justify-center ">
                        <img src={heroImage}/>
                    </div>

                    {/* Floating elements can be added here */}
                </div>
            </div>
        </section>
    );
}