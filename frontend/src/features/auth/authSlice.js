import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi, registerApi, meApi } from "../../api/authApi";
import { saveTokens, clearTokens, getAccessToken } from "../../utils/tokenManager";

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, thunkAPI) => {
    try {
      const res = await loginApi(username, password);
      saveTokens(res.data);
      const meRes = await meApi();
      return meRes.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { detail: "Login failed" }
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload, thunkAPI) => {
    try {
      await registerApi(payload);
      // auto-login after register
      const { username, password } = payload;
      const res = await loginApi(username, password);
      saveTokens(res.data);
      const meRes = await meApi();
      return meRes.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { detail: "Registration failed" }
      );
    }
  }
);

export const loadUserFromToken = createAsyncThunk(
  "auth/loadUserFromToken",
  async (_, thunkAPI) => {
    const token = getAccessToken();
    if (!token) return thunkAPI.rejectWithValue({ detail: "No token" });
    try {
      const res = await meApi();
      return res.data;
    } catch (err) {
      clearTokens();
      return thunkAPI.rejectWithValue(
        err.response?.data || { detail: "Could not load user" }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      clearTokens();
    },
  },
  extraReducers: (builder) => {
    const start = (state) => {
      state.loading = true;
      state.error = null;
    };
    const success = (state, action) => {
      state.loading = false;
      state.user = action.payload?.user || action.payload;
      state.isAuthenticated = true;
    };
    const fail = (state, action) => {
      state.loading = false;
      state.error = action.payload?.detail || "Error";
      state.isAuthenticated = false;
    };

    builder
      .addCase(login.pending, start)
      .addCase(login.fulfilled, success)
      .addCase(login.rejected, fail)
      .addCase(register.pending, start)
      .addCase(register.fulfilled, success)
      .addCase(register.rejected, fail)
      .addCase(loadUserFromToken.pending, start)
      .addCase(loadUserFromToken.fulfilled, success)
      .addCase(loadUserFromToken.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
