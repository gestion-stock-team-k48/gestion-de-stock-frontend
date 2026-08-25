import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { articleApi } from "../api/articleApi";
import type { ArticleRequest } from "../types";

export function useArticles() {
  const queryClient = useQueryClient();

  const articlesQuery = useQuery({
    queryKey: ["articles"],
    queryFn: async () =>
      (await articleApi.getAll({ page: 0, size: 500 })).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: ArticleRequest) => articleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => articleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });

  return {
    articles: articlesQuery.data?.content ?? [],
    totalElements: articlesQuery.data?.totalElements ?? 0,
    isLoading: articlesQuery.isLoading,
    isError: articlesQuery.isError,
    createArticle: createMutation,
    deleteArticle: deleteMutation,
  };
}

export function useArticleList() {
  return useQuery({
    queryKey: ["articles", "list"],
    queryFn: async () =>
      (await articleApi.getAll({ page: 0, size: 500 })).data.content,
  });
}
