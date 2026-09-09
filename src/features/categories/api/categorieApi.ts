import { axiosInstance } from "../../../core/api/axiosInstance";
import type { CategoryRequest, CategoryResponse } from "../types";

export const categorieApi = {
  getAll: () => axiosInstance.get<CategoryResponse[]>("/categories"),
  getById: (id: number) => axiosInstance.get<CategoryResponse>(`/categories/${id}`),
  create: (data: CategoryRequest) => axiosInstance.post<CategoryResponse>("/categories", data),
  update: (id: number, data: CategoryRequest) =>
    axiosInstance.put<CategoryResponse>(`/categories/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/categories/${id}`),
};
