import axiosInstance from "../../../core/api/axiosInstance";
import type { ArticleRequest } from "../types";

export const articleApi = {
    getAll: () => axiosInstance.get("/articles"),
    getById: (id: number) => axiosInstance.get(`/articles/${id}`),
    create: (data: ArticleRequest) => axiosInstance.post("/articles", data),
    update: (id: number, data: ArticleRequest) => axiosInstance.put(`/articles/${id}`, data),
    uploadPhoto: (id: number, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return axiosInstance.post(`/articles/${id}/photo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};