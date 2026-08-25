import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mvtStkApi } from "../api/mvtStkApi";
import type { MvtStkRequest, MvtStkCorrectionRequest } from "../types";

export function useStockMouvements() {
  const movementsQuery = useQuery({
    queryKey: ["mouvements-stock", "all"],
    queryFn: () => mvtStkApi.getAllMovements(),
  });

  return {
    movements: movementsQuery.data ?? [],
    isLoading: movementsQuery.isLoading,
    isError: movementsQuery.isError,
  };
}

export function useStockAlertes() {
  const alertesQuery = useQuery({
    queryKey: ["mouvements-stock", "alertes"],
    queryFn: async () => (await mvtStkApi.getAlertes()).data,
  });

  return {
    alertes: alertesQuery.data ?? [],
    isLoading: alertesQuery.isLoading,
    isError: alertesQuery.isError,
  };
}

export function useStockReel(idArticle: number | null) {
  return useQuery({
    queryKey: ["mouvements-stock", "stock-reel", idArticle],
    queryFn: async () => (await mvtStkApi.getStockReel(idArticle!)).data,
    enabled: idArticle !== null,
  });
}

export function useStockMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["mouvements-stock"] });
  };

  const createEntree = useMutation({
    mutationFn: (data: MvtStkRequest) => mvtStkApi.createEntree(data),
    onSuccess: invalidateAll,
  });

  const createSortie = useMutation({
    mutationFn: (data: MvtStkRequest) => mvtStkApi.createSortie(data),
    onSuccess: invalidateAll,
  });

  const createCorrectionPositive = useMutation({
    mutationFn: (data: MvtStkCorrectionRequest) =>
      mvtStkApi.createCorrectionPositive(data),
    onSuccess: invalidateAll,
  });

  const createCorrectionNegative = useMutation({
    mutationFn: (data: MvtStkCorrectionRequest) =>
      mvtStkApi.createCorrectionNegative(data),
    onSuccess: invalidateAll,
  });

  return {
    createEntree,
    createSortie,
    createCorrectionPositive,
    createCorrectionNegative,
  };
}
