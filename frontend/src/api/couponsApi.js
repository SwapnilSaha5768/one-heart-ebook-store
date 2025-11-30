import client from "./axiosClient";

export const applyCouponApi = (code, amount) =>
  client.post("/coupons/apply/", { code, amount });
