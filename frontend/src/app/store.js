import { configureStore } from "@reduxjs/toolkit";
import booksReducer from "../features/books/booksSlice";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";

export const store = configureStore({
  reducer: {
    books: booksReducer,
    auth: authReducer,
    cart: cartReducer,
  },
});

export default store;
