import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi, registerApi, meApi } from "../../api/authApi";
import { saveTokens, clearTokens, getAccessToken } from "../../utils/tokenManager";

/**
 * LOGIN
 */
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, thunkAPI) => {
    try {
      const res = await loginApi(username, password);
      saveTokens(res.data);
      const meRes = await meApi();
      return meRes.data; // { user, profile, addresses }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { detail: "Login failed" }
      );
    }
  }
);

/**
 * REGISTER
 * - Only registers user and triggers email OTP
 * - DOES NOT auto-login
 */
export const register = createAsyncThunk(
  "auth/register",
  async (payload, thunkAPI) => {
    try {
      const res = await registerApi(payload);
      // backend returns: { detail: "...", email: "..." }
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data || { detail: "Registration failed" }
      );
    }
  }
);

/**
 * LOAD USER FROM EXISTING TOKEN
 */
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
    pendingEmail: null,          // for verify-email page
    registrationMessage: null,   // e.g. "OTP sent to your email"
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
      state.error = action.payload?.detail || action.payload || "Error";
      state.isAuthenticated = false;
    };

    builder
      // LOGIN
      .addCase(login.pending, start)
      .addCase(login.fulfilled, success)
      .addCase(login.rejected, fail)

      // REGISTER (special handling – no auto login)
      .addCase(register.pending, start)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = false;  // still not logged in
        state.user = null;              // no user yet
        state.pendingEmail = action.payload?.email || null;
        state.registrationMessage =
          action.payload?.detail ||
          "We sent a verification code to your email. Please verify.";
      })
      .addCase(register.rejected, fail)

      // LOAD USER FROM TOKEN
      .addCase(loadUserFromToken.pending, start)
      .addCase(loadUserFromToken.fulfilled, success)
      .addCase(loadUserFromToken.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
