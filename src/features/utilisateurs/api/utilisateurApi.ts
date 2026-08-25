import axiosInstance from "../../../core/api/axiosInstance";
import type {
    UtilisateurRequest,
    UtilisateurResponse,
    ChangePasswordRequest,
} from "../types";

export const utilisateurApi = {
    getMine: () => axiosInstance.get<UtilisateurResponse>("/utilisateurs/me"),

    getAll: () => axiosInstance.get<UtilisateurResponse[]>("/utilisateurs"),

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