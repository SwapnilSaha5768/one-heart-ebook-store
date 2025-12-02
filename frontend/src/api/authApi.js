// src/api/authApi.js
import axiosClient from "./axiosClient";

/**
 * Auth endpoints – return axios promises (response object)
 * These are probably used in authSlice / login / register pages.
 */

export const loginApi = (username, password) =>
  axiosClient.post("/auth/login/", { username, password });

export const registerApi = (data) =>
  axiosClient.post("/auth/register/", data);

export const meApi = () => axiosClient.get("/auth/me/");

/**
 * Convenience helpers – return just `data`
 * These are what we used in ProfilePage.
 */

export const getMe = async () => {
  const res = await meApi(); // reuse meApi
  return res.data;
};

export const updateMe = async (payload) => {
  const res = await axiosClient.patch("/auth/me/", payload);
  return res.data;
};

export const verifyEmailApi = (email, code) =>
  axiosClient.post("/auth/verify-email/", { email, code });

export const resendOtpApi = (email) =>
  axiosClient.post("/auth/resend-otp/", { email });

export const forgotPasswordRequestApi = (identifier) =>
  axiosClient.post("/auth/forgot-password/", { identifier });

export const resetPasswordApi = (email, code, newPassword) =>
  axiosClient.post("/auth/reset-password/", {
    email,
    code,
    new_password: newPassword,
  });
