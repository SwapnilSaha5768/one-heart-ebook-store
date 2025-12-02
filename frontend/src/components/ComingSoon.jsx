import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ComingSoon() {
    const { items: books } = useSelector((state) => state.books);

    const comingSoonBook = books.find(book =>
        book.categories?.some(c => c.name.toLowerCase() === "coming soon") ||
        book.tags?.some(t => t.name.toLowerCase() === "coming soon")
    );

    return (
        <section className="py-16 bg-[#F5F0E6] relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center md:justify-start relative z-10 order-2 md:order-1">
                    <div className="w-64 h-96 bg-gray-800 rounded-r-xl shadow-2xl transform -rotate-6 border-l-4 border-gray-700 flex items-center justify-center text-white overflow-hidden">
                        {comingSoonBook && comingSoonBook.cover_image ? (
                            <img
                                src={comingSoonBook.cover_image}
                                alt={comingSoonBook.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-center px-4">Book Cover<br />Placeholder</span>
                        )}
                    </div>
                    <div className="absolute top-10 left-10 w-64 h-96 bg-gray-900/20 rounded-r-xl -z-10 transform -rotate-3"></div>
                </div>

                <div className="text-center md:text-right z-10 order-1 md:order-2">
                    <h2 className="text-5xl md:text-6xl lg:text-8xl font-black text-gray-800 tracking-tighter uppercase opacity-90 drop-shadow-sm">
                        Coming<br />Soon
                    </h2>
                </div>
            </div>

            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
        </section>
    );
}
