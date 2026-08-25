import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fournisseursApi } from "../api/fournisseursApi";
import type { FournisseurRequest } from "../types";

export function useFournisseurs() {
  const queryClient = useQueryClient();

  const fournisseursQuery = useQuery({
    queryKey: ["fournisseurs"],
    queryFn: async () => (await fournisseursApi.getAll()).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: FournisseurRequest) => fournisseursApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fournisseurs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fournisseursApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fournisseurs"] });
    },
  });

  return {
    fournisseurs: fournisseursQuery.data?.content ?? [],
    totalElements: fournisseursQuery.data?.totalElements ?? 0,
    isLoading: fournisseursQuery.isLoading,
    isError: fournisseursQuery.isError,
    createFournisseur: createMutation,
    deleteFournisseur: deleteMutation,
  };
}
