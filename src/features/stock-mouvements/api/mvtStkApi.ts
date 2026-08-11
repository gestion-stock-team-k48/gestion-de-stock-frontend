import { axiosInstance } from '../../../core/api/axiosInstance'
import type { MvtStkRequest, MvtStkCorrectionRequest } from '../types/index';

export const mvtStkApi = {
  getAlertes: () => axiosInstance.get('/api/mouvements-stock/alertes-stock'),
  getStockReel: (idArticle: number) => axiosInstance.get(`/api/mouvements-stock/article/${idArticle}/stock-reel`),
  getHistorique: (idArticle: number) => axiosInstance.get(`/api/mouvements-stock/article/${idArticle}`),
  createEntree: (data: MvtStkRequest) => axiosInstance.post('/api/mouvements-stock/entree', data),
  createSortie: (data: MvtStkRequest) => axiosInstance.post('/api/mouvements-stock/sortie', data),
  createCorrectionPositive: (data: MvtStkCorrectionRequest) =>
    axiosInstance.post('/api/mouvements-stock/correction-positive', data),
  createCorrectionNegative: (data: MvtStkCorrectionRequest) =>
    axiosInstance.post('/api/mouvements-stock/correction-negative', data),
}