// src/api/blogApi.js
import axiosClient from "./axiosClient";

export const fetchPosts = async () => {
  const res = await axiosClient.get("/blog/posts/");
  return res.data;
};

export const fetchPostById = async (id) => {
  const res = await axiosClient.get(`/blog/posts/${id}/`);
  return res.data;
};
