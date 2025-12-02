// src/api/addressesApi.js
import axiosClient from "./axiosClient";

/**
 * Core helpers – these all return `res.data`
 */

export const fetchAddresses = async () => {
  const res = await axiosClient.get("/auth/addresses/");
  return res.data;
};

export const createAddress = async (payload) => {
  const res = await axiosClient.post("/auth/addresses/", payload);
  return res.data;
};

export const updateAddress = async (id, payload) => {
  const res = await axiosClient.patch(`/auth/addresses/${id}/`, payload);
  return res.data;
};

export const deleteAddress = async (id) => {
  const res = await axiosClient.delete(`/auth/addresses/${id}/`);
  return res.data; // if your backend doesn’t return anything, callers can ignore this
};

/**
 * Compatibility aliases – keep old names used in other files
 * These simply call the core helpers above.
 */

export const getAddressesApi = fetchAddresses;
export const createAddressApi = createAddress;