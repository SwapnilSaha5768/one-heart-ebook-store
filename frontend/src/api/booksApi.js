import client from "./axiosClient";

export const fetchBooks = (params = {}) =>
  client.get("/books/", { params });

export const fetchBookBySlug = (slug) =>
  client.get(`/books/${slug}/`);
