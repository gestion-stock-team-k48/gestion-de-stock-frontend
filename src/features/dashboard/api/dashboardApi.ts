import { axiosInstance } from "../../../core/api/axiosInstance";
import type { DashboardStatsResponse } from "../types";

export const dashboardApi = {
  getStats: () => axiosInstance.get<DashboardStatsResponse>("/dashboard/statistiques"),
};
