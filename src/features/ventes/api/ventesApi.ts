import { axiosInstance } from '../../../core/api/axiosInstance'
import type { VenteRequest } from '../types'

export const ventesApi = {
  getAll: () => axiosInstance.get('/api/ventes'),
  getById: (id: number) => axiosInstance.get(`/api/ventes/${id}`),
  getByCode: (code: string) => axiosInstance.get(`/api/ventes/code/${code}`),
  create: (data: VenteRequest) => axiosInstance.post('/api/ventes', data),
  delete: (id: number) => axiosInstance.delete(`/api/ventes/${id}`),
}