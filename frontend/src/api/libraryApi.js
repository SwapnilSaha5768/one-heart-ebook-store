import client from "./axiosClient";

export const getLibraryApi = () => client.get("/library/");
export const generateDownloadLinkApi = (purchaseItemId) =>
  client.post(`/library/${purchaseItemId}/download-link/`);
