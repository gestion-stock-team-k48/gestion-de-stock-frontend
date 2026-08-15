import axiosInstance from "../../../core/api/axiosInstance";
import type { PageResponse } from "../../../core/types";
import type { ArticleRequest, ArticleResponse } from "../types";

type PageableParams = {
    page?: number;
    size?: number;
    sort?: string[];
};

export const articleApi = {
    getAll: (params: PageableParams = { page: 0, size: 100 }) =>
        axiosInstance.get<PageResponse<ArticleResponse>>("/articles", { params }),
    getById: (id: number) => axiosInstance.get<ArticleResponse>(`/articles/${id}`),
    create: (data: ArticleRequest) => axiosInstance.post<ArticleResponse>("/articles", data),
    update: (id: number, data: ArticleRequest) => axiosInstance.put<ArticleResponse>(`/articles/${id}`, data),
    delete: (id: number) => axiosInstance.delete(`/articles/${id}`),
    uploadPhoto: (id: number, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return axiosInstance.post(`/articles/${id}/photo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};
