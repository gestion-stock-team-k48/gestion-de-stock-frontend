import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";

export function useDashboard() {
  const statsQuery = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => (await dashboardApi.getStats()).data,
  });

  return {
    stats: statsQuery.data,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
  };
}
