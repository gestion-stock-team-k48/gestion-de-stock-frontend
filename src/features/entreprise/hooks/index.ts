import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entrepriseApi } from "../api/entrepriseApi";
import type { EntrepriseRequest } from "../types";

export function useEntreprise() {
  const queryClient = useQueryClient();

  const entrepriseQuery = useQuery({
    queryKey: ["entreprise", "me"],
    queryFn: async () => (await entrepriseApi.getEntreprise()).data,
  });

  const updateMutation = useMutation({
    mutationFn: (data: EntrepriseRequest) => entrepriseApi.updateEntreprise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entreprise", "me"] });
    },
  });

  return {
    entreprise: entrepriseQuery.data,
    isLoading: entrepriseQuery.isLoading,
    isError: entrepriseQuery.isError,
    updateEntreprise: updateMutation,
  };
}
