import axiosInstance from "../../../core/api/axiosInstance";
import type {
    UtilisateurRequest,
    UtilisateurMeRequest,
    UtilisateurResponse,
    ChangePasswordRequest,
} from "../types";
import type { PageResponse } from "../../../core/types";

type PageableParams = {
    page?: number;
    size?: number;
    sort?: string[];
};

export const utilisateurApi = {
    getMine: () => axiosInstance.get<UtilisateurResponse>("/utilisateurs/me"),

    updateMine: (data: UtilisateurMeRequest) =>
        axiosInstance.put<UtilisateurResponse>("/utilisateurs/me", data),

    getAll: (params: PageableParams = { page: 0, size: 200 }) =>
        axiosInstance.get<PageResponse<UtilisateurResponse>>("/utilisateurs", { params }),

    getById: (id: number) =>
        axiosInstance.get<UtilisateurResponse>(`/utilisateurs/${id}`),

    create: (data: UtilisateurRequest) =>
        axiosInstance.post<UtilisateurResponse>("/utilisateurs", data),

    update: (id: number, data: UtilisateurRequest) =>
        axiosInstance.put<UtilisateurResponse>(`/utilisateurs/${id}`, data),

    delete: (id: number) => axiosInstance.delete(`/utilisateurs/${id}`),

    uploadPhoto: (id: number, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return axiosInstance.post<UtilisateurResponse>(
            `/utilisateurs/${id}/photo`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
    },

    changePassword: (data: ChangePasswordRequest) =>
        axiosInstance.post("/utilisateurs/change-password", data),
};