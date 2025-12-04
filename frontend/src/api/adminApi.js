import axiosClient from "./axiosClient";

export const getDashboardStats = async () => {
    const response = await axiosClient.get("/dashboard/stats/");
    return response.data;
};

export const getAdminOrders = async () => {
    const response = await axiosClient.get("/orders/admin/");
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await axiosClient.patch(`/orders/admin/${id}/`, { status });
    return response.data;
};

export const deleteOrder = async (id) => {
    await axiosClient.delete(`/orders/admin/${id}/`);
};

export const getAdminBooks = async () => {
    const response = await axiosClient.get("/admin/books/");
    return response.data;
};

export const getAdminBlogs = async () => {
    const response = await axiosClient.get("/admin/blog/posts/");
    return response.data;
};

export const getAdminUsers = async () => {
    const response = await axiosClient.get("/auth/users/");
    return response.data;
};

export const getAuthors = async () => {
    const response = await axiosClient.get("/authors/");
    return response.data;
};

export const getCategories = async () => {
    const response = await axiosClient.get("/categories/");
    return response.data;
};

export const getTags = async () => {
    const response = await axiosClient.get("/tags/");
    return response.data;
};

export const createAuthor = async (data) => {
    const response = await axiosClient.post("/authors/", data);
    return response.data;
};

// Books CRUD
export const createBook = async (data) => {
    const response = await axiosClient.post("/admin/books/", data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const updateBook = async (id, data) => {
    const response = await axiosClient.patch(`/admin/books/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const deleteBook = async (id) => {
    await axiosClient.delete(`/admin/books/${id}/`);
};

// Blogs CRUD
export const createBlog = async (data) => {
    const response = await axiosClient.post("/admin/blog/posts/", data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const updateBlog = async (id, data) => {
    const response = await axiosClient.patch(`/admin/blog/posts/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const deleteBlog = async (id) => {
    await axiosClient.delete(`/admin/blog/posts/${id}/`);
};
