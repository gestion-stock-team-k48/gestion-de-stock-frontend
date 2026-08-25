import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commandeClientsApi } from "../api/commandesClientsApi";
import type { CommandeClientRequest } from "../types";
import type { EtatCommande } from "../../../core/types";

export function useCommandesClients() {
  const queryClient = useQueryClient();

  const commandesQuery = useQuery({
    queryKey: ["commandes-clients"],
    queryFn: async () =>
      (await commandeClientsApi.getAll({ page: 0, size: 200 })).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: CommandeClientRequest) => commandeClientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes-clients"] });
    },
  });

  const updateEtatMutation = useMutation({
    mutationFn: ({ id, etat }: { id: number; etat: EtatCommande }) =>
      commandeClientsApi.updateEtat(id, etat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes-clients"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => commandeClientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes-clients"] });
    },
  });

  return {
    commandes: commandesQuery.data?.content ?? [],
    totalElements: commandesQuery.data?.totalElements ?? 0,
    isLoading: commandesQuery.isLoading,
    isError: commandesQuery.isError,
    createCommande: createMutation,
    updateEtat: updateEtatMutation,
    deleteCommande: deleteMutation,
  };
}

export function useHistoriqueClient(idClient: number | null) {
  return useQuery({
    queryKey: ["commandes-clients", "historique", idClient],
    queryFn: async () =>
      (await commandeClientsApi.getHistoric(idClient!)).data,
    enabled: idClient !== null,
  });
}
