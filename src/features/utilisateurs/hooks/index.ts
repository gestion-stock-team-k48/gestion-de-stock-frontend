import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { utilisateurApi } from "../api/utilisateurApi";
import type { UtilisateurRequest } from "../types";

export function useUtilisateurs() {
  const queryClient = useQueryClient();

  const utilisateursQuery = useQuery({
    queryKey: ["utilisateurs"],
    queryFn: async () => (await utilisateurApi.getAll()).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: UtilisateurRequest) => utilisateurApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UtilisateurRequest }) =>
      utilisateurApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => utilisateurApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
    },
  });

  return {
    utilisateurs: utilisateursQuery.data?.content ?? [],
    isLoading: utilisateursQuery.isLoading,
    isError: utilisateursQuery.isError,
    createUtilisateur: createMutation,
    updateUtilisateur: updateMutation,
    deleteUtilisateur: deleteMutation,
  };
}
