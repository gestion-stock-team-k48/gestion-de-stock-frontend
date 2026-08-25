import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../api/clientsApi";
import type { ClientRequest } from "../types";

export function useClients() {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async () =>
      (await clientsApi.getAll({ page: 0, size: 500 })).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: ClientRequest) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  return {
    clients: clientsQuery.data?.content ?? [],
    totalElements: clientsQuery.data?.totalElements ?? 0,
    isLoading: clientsQuery.isLoading,
    isError: clientsQuery.isError,
    createClient: createMutation,
    deleteClient: deleteMutation,
  };
}

export function useClientList() {
  return useQuery({
    queryKey: ["clients", "list"],
    queryFn: async () =>
      (await clientsApi.getAll({ page: 0, size: 500 })).data.content,
  });
}
