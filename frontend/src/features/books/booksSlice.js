import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchBooks } from "../../api/booksApi";

export const loadBooks = createAsyncThunk(
  "books/loadBooks",
  async (params, thunkAPI) => {
    try {
      const res = await fetchBooks(params);
      // if paginated: res.data.results, otherwise res.data
      return res.data.results ?? res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { detail: "Error" });
    }
  }
);

const booksSlice = createSlice({
  name: "books",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || "Failed to load books";
      });
  },
});

export default booksSlice.reducer;
