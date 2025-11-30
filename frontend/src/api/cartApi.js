// src/api/cartApi.js
import client from "./axiosClient";

export const getCart = () => client.get("/cart/");

export const addCartItem = (book_id, quantity = 1) =>
  client.post("/cart/items/", { book_id, quantity });

export const updateCartItemApi = (id, quantity) =>
  client.patch(`/cart/items/${id}/`, { quantity });

export const deleteCartItemApi = (id) =>
  client.delete(`/cart/items/${id}/`);
