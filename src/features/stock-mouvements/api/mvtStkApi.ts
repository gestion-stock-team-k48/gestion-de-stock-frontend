import { axiosInstance } from '../../../core/api/axiosInstance'
import type { MvtStkRequest, MvtStkCorrectionRequest, MvtStkResponse } from '../types/index';
import type { PageResponse } from '../../../core/types';
import { articleApi } from '../../articles/api/articleApi';

export const mvtStkApi = {
  getAlertes: () => axiosInstance.get('/mouvements-stock/alertes-stock'),
  getStockReel: (idArticle: number) => axiosInstance.get(`/mouvements-stock/article/${idArticle}/stock-reel`),
  getHistorique: (idArticle: number, params?: { page?: number; size?: number }) =>
    axiosInstance.get<PageResponse<MvtStkResponse>>(`/mouvements-stock/article/${idArticle}`, { params }),
  createEntree: (data: MvtStkRequest) => axiosInstance.post('/mouvements-stock/entree', data),
  createSortie: (data: MvtStkRequest) => axiosInstance.post('/mouvements-stock/sortie', data),
  createCorrectionPositive: (data: MvtStkCorrectionRequest) =>
    axiosInstance.post('/mouvements-stock/correction-positive', data),
  createCorrectionNegative: (data: MvtStkCorrectionRequest) =>
    axiosInstance.post('/mouvements-stock/correction-negative', data),

  /**
   * Récupère tous les mouvements de stock (tous articles confondus).
   * Le backend n'a pas d'endpoint global, donc on fetch les mouvements
   * de chaque article et on les fusionne côté client.
   */
  getAllMovements: async (): Promise<MvtStkResponse[]> => {
    const articlesRes = await articleApi.getAll({ page: 0, size: 500 });
    const articles = articlesRes.data.content;

    const allMovements: MvtStkResponse[] = [];
    for (const article of articles) {
      try {
        const mvtRes = await axiosInstance.get<PageResponse<MvtStkResponse>>(
          `/mouvements-stock/article/${article.id}`,
          { params: { page: 0, size: 500 } },
        );
        allMovements.push(...mvtRes.data.content);
      } catch {
        // Skip articles with no movements
      }
    }

    return allMovements.sort(
      (a, b) => new Date(b.dateMvt).getTime() - new Date(a.dateMvt).getTime(),
    );
  },
} as const;