import client from "./axiosClient";

export const checkoutApi = (data) => client.post("/checkout/", data);
export const getOrdersApi = () => client.get("/orders/");
export const getOrderApi = (id) => client.get(`/orders/${id}/`);
