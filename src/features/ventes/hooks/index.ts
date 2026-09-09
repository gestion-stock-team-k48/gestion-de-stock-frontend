import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ventesApi } from "../api/ventesApi";
import type { VenteRequest } from "../types";

export function useVentes() {
  const queryClient = useQueryClient();

  const ventesQuery = useQuery({
    queryKey: ["ventes"],
    queryFn: async () =>
      (await ventesApi.getAll({ page: 0, size: 200 })).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: VenteRequest) => ventesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ventes"] });
      queryClient.invalidateQueries({ queryKey: ["mouvements-stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ventesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ventes"] });
      queryClient.invalidateQueries({ queryKey: ["mouvements-stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    ventes: ventesQuery.data?.content ?? [],
    totalElements: ventesQuery.data?.totalElements ?? 0,
    isLoading: ventesQuery.isLoading,
    isError: ventesQuery.isError,
    createVente: createMutation,
    deleteVente: deleteMutation,
  };
}
