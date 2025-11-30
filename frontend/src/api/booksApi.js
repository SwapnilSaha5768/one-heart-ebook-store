import client from "./axiosClient";

export const fetchBooks = (params = {}) =>
  client.get("/books/", { params });
