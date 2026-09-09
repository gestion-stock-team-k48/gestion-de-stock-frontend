import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commandeFournisseursApi } from "../api/commandeFournisseursApi";
import type { CommandeFournisseurRequest } from "../types";
import type { EtatCommande } from "../../../core/types";

export function useCommandesFournisseurs(page = 0, size = 20) {
  const queryClient = useQueryClient();

  const commandesQuery = useQuery({
    queryKey: ["commandes-fournisseurs", page, size],
    queryFn: async () =>
      (await commandeFournisseursApi.getAll({ page, size })).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: CommandeFournisseurRequest) =>
      commandeFournisseursApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes-fournisseurs"] });
      queryClient.invalidateQueries({ queryKey: ["mouvements-stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CommandeFournisseurRequest }) =>
      commandeFournisseursApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes-fournisseurs"] });
      queryClient.invalidateQueries({ queryKey: ["mouvements-stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateEtatMutation = useMutation({
    mutationFn: ({ id, etat }: { id: number; etat: EtatCommande }) =>
      commandeFournisseursApi.updateEtat(id, etat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes-fournisseurs"] });
      queryClient.invalidateQueries({ queryKey: ["mouvements-stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => commandeFournisseursApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes-fournisseurs"] });
      queryClient.invalidateQueries({ queryKey: ["mouvements-stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    commandes: commandesQuery.data?.content ?? [],
    totalElements: commandesQuery.data?.totalElements ?? 0,
    isLoading: commandesQuery.isLoading,
    isError: commandesQuery.isError,
    totalPages: commandesQuery.data?.totalPages ?? 0,
    createCommande: createMutation,
    updateCommande: updateMutation,
    updateEtat: updateEtatMutation,
    deleteCommande: deleteMutation,
  };
}

export function useCommandeFournisseur(id: number | null) {
  return useQuery({
    queryKey: ["commandes-fournisseurs", id],
    queryFn: async () => (await commandeFournisseursApi.getById(id!)).data,
    enabled: id !== null,
  });
}

export function useHistoriqueFournisseur(idFournisseur: number | null) {
  return useQuery({
    queryKey: ["commandes-fournisseurs", "historique", idFournisseur],
    queryFn: async () =>
      (await commandeFournisseursApi.getHistoric(idFournisseur!)).data,
    enabled: idFournisseur !== null,
  });
}
