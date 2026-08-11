import axiosInstance from "../../../core/api/axiosInstance";
import type {
    RegisterRequest,
    AuthenticationRequest,
    AuthenticationResponse,
} from "../types";

export const authApi = {
    register: (data: RegisterRequest) =>
        axiosInstance.post<AuthenticationResponse>("/auth/register", data),

    authenticate: (data: AuthenticationRequest) =>
        axiosInstance.post<AuthenticationResponse>("/auth/authenticate", data),

    refreshToken: () =>
        axiosInstance.post<AuthenticationResponse>("/auth/refresh-token"),
};