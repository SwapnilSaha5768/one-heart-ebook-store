import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadBooks } from "../features/books/booksSlice";
import Hero from "../components/Hero";
import ComingSoon from "../components/ComingSoon";
import MostSelling from "../components/MostSelling";
import BookCategories from "../components/BookCategories";
import LatestArticles from "../components/LatestArticles";

export default function Home() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.books);

  useEffect(() => {
    dispatch(loadBooks());
  }, [dispatch]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (error) return <div className="p-20 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="flex flex-col">
      <Hero />
      <MostSelling />
      <ComingSoon />
      <BookCategories />
      <LatestArticles />
    </div>
  );
}