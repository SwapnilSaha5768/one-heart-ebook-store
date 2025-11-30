import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["All", "Education", "Parenting", "Science", "Sports", "Fiction"];

export default function BookCategories() {
    const [activeCategory, setActiveCategory] = useState("All");
    const { items: books } = useSelector((state) => state.books);
    const navigate = useNavigate();

    const filteredBooks = activeCategory === "All"
        ? books
        : books.filter((book) =>
            book.categories?.some((c) => c.name.toLowerCase() === activeCategory.toLowerCase())
        );

    const [startIndex, setStartIndex] = useState(0);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isCarousel = filteredBooks.length > (isMobile ? 1 : 4);

    const nextSlide = () => {
        if (!isCarousel) return;
        setStartIndex((prev) => (prev + 1) % filteredBooks.length);
    };

    const prevSlide = () => {
        if (!isCarousel) return;
        setStartIndex((prev) => (prev - 1 + filteredBooks.length) % filteredBooks.length);
    };

    const getVisibleBooks = () => {
        if (!isCarousel) return filteredBooks;
        const count = isMobile ? 1 : 4;
        const books = [];
        for (let i = 0; i < count; i++) {
            books.push(filteredBooks[(startIndex + i) % filteredBooks.length]);
        }
        return books;
    };

    const visibleBooks = getVisibleBooks();

    // Swipe Handlers
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) nextSlide();
        if (isRightSwipe) prevSlide();
    };

    return (
        <section className="py-16 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-4xl font-bold font-serif text-center mb-10 text-brand-dark">
                    Book Categories
                </h2>

                {/* Categories Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setStartIndex(0); }}
                            className={`px-6 py-2 rounded-lg border transition-all duration-300 font-medium ${activeCategory === cat
                                ? "bg-brand-red text-white border-brand-red shadow-md"
                                : "bg-white text-gray-600 border-brand-red hover:bg-red-50"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Carousel / Grid */}
                <div className="relative flex items-center justify-center">

                    {/* Books Track */}
                    <div
                        className="flex items-center justify-center gap-4 py-8 w-full flex-wrap sm:flex-nowrap"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {visibleBooks.map((book, index) => {
                            // Carousel Logic: index 0 and 3 are outer (blurred), 1 and 2 are inner (focused)
                            // Only apply if isCarousel is true AND not mobile
                            const isOuter = isCarousel && !isMobile && (index === 0 || index === 3);

                            return (
                                <div
                                    key={`${book.id}-${index}`}
                                    onClick={() => {
                                        if (isCarousel && isOuter) {
                                            if (index === 0) prevSlide();
                                            if (index === 3) nextSlide();
                                        }
                                    }}
                                    className={`flex flex-col items-center text-center transition-all duration-500 transform ${isCarousel
                                        ? (isOuter
                                            ? "scale-90 opacity-60 blur-[2px] grayscale-[30%] cursor-pointer"
                                            : "scale-100 opacity-100 shadow-xl z-10 bg-white rounded-xl")
                                        : "scale-100 opacity-100 shadow-md bg-white rounded-xl hover:shadow-lg"
                                        } w-64 flex-shrink-0`}
                                >
                                    <div
                                        className="relative w-full aspect-[3/4] overflow-hidden rounded-t-lg cursor-pointer"
                                        onClick={(e) => {
                                            if (isCarousel && isOuter) {
                                                // Prevent navigation if clicking outer item, let parent handle slide
                                                e.preventDefault();
                                                return;
                                            }
                                            navigate(`/books/${book.slug}`);
                                        }}
                                    >
                                        {book.cover_image ? (
                                            <img
                                                src={book.cover_image}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                No Cover
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 w-full">
                                        <h3 className="text-lg font-bold font-serif text-gray-800 mb-1 line-clamp-1">
                                            {book.title}
                                        </h3>

                                        <div className="mt-auto flex flex-col items-center gap-2 w-full">
                                            <span className="text-brand-red font-bold">
                                                {book.effective_price || book.price} {book.currency || "BDT"}
                                            </span>

                                            <div className="flex gap-2 w-full">
                                                <button className="flex-1 bg-brand-red text-white py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors">
                                                    Add To Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredBooks.length === 0 && (
                            <div className="text-center text-gray-500 py-10 w-full">
                                No books found in this category.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
