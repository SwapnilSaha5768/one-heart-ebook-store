// src/features/cart/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCart,
  addCartItem,
  updateCartItemApi,
  deleteCartItemApi,
} from "../../api/cartApi";

export const loadCart = createAsyncThunk(
  "cart/loadCart",
  async (_, thunkAPI) => {
    try {
      const res = await getCart();
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { detail: "Failed to load cart" }
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ bookId, quantity = 1 }, thunkAPI) => {
    try {
      const res = await addCartItem(bookId, quantity);
      return res.data; // full cart
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { detail: "Failed to add to cart" }
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ id, quantity }, thunkAPI) => {
    try {
      const res = await updateCartItemApi(id, quantity);
      return res.data; // full cart
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { detail: "Failed to update cart item" }
      );
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (id, thunkAPI) => {
    try {
      const res = await deleteCartItemApi(id);
      return res.data; // full cart
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { detail: "Failed to remove cart item" }
      );
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: null,      // will hold { id, items: [...] }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const start = (state) => {
      state.loading = true;
      state.error = null;
    };
    const success = (state, action) => {
      state.loading = false;
      state.cart = action.payload;
    };
    const fail = (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || "Cart error";
    };

    builder
      .addCase(loadCart.pending, start)
      .addCase(loadCart.fulfilled, success)
      .addCase(loadCart.rejected, fail)
      .addCase(addToCart.pending, start)
      .addCase(addToCart.fulfilled, success)
      .addCase(addToCart.rejected, fail)
      .addCase(updateCartItem.pending, start)
      .addCase(updateCartItem.fulfilled, success)
      .addCase(updateCartItem.rejected, fail)
      .addCase(removeCartItem.pending, start)
      .addCase(removeCartItem.fulfilled, success)
      .addCase(removeCartItem.rejected, fail);
  },
});

export default cartSlice.reducer;
