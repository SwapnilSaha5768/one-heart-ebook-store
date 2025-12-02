import { Link } from "react-router-dom";

export default function Hero() {
    return (
        <section className="relative bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-6 z-10 order-2 lg:order-1">
                    <div className="relative inline-block">
                        {/* Decorative element if needed */}
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
                            className="inline-block bg-brand-red text-white font-semibold px-8 py-3 rounded-md shadow-lg hover:bg-red-600 transition-colors uppercase tracking-wide"
                        >
                            Explore
                        </Link>
                    </div>
                </div>

                {/* Right Content - Images */}
                <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
                    {/* Placeholder for Hero Image */}
                    <div className="relative w-full max-w-md aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shadow-xl">
                        <span className="text-gray-400 font-medium">Hero Image Placeholder</span>
                        {/* If you have the image, use: <img src="/path/to/hero-image.png" alt="Hero" className="object-cover w-full h-full" /> */}
                    </div>

                    {/* Floating elements can be added here */}
                </div>
            </div>
        </section>
    );
}