import { axiosInstance } from '../../../core/api/axiosInstance'
import type { PageResponse } from '../../../core/types'
import type { VenteRequest, VenteResponse } from '../types'

type PageableParams = {
  page?: number
  size?: number
  sort?: string[]
}

export const ventesApi = {
  getAll: (params: PageableParams = { page: 0, size: 100 }) =>
    axiosInstance.get<PageResponse<VenteResponse>>('/ventes', { params }),
  getById: (id: number) => axiosInstance.get<VenteResponse>(`/ventes/${id}`),
  getByCode: (code: string) => axiosInstance.get<VenteResponse>(`/ventes/code/${code}`),
  create: (data: VenteRequest) => axiosInstance.post<VenteResponse>('/ventes', data),
  delete: (id: number) => axiosInstance.delete(`/ventes/${id}`),
}
