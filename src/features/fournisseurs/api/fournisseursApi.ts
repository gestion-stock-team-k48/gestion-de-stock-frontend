import { axiosInstance } from '../../../core/api/axiosInstance'
import type { FournisseurRequest, FournisseurResponse } from '../types'
import type { PageResponse } from '../../../core/types'

type PageableParams = {
  page?: number
  size?: number
  sort?: string[]
}

export const fournisseursApi = {
  getAll: (params: PageableParams = { page: 0, size: 100 }) =>
    axiosInstance.get<PageResponse<FournisseurResponse>>('/fournisseurs', { params }),
  getById: (id: number) => axiosInstance.get(`/fournisseurs/${id}`),
  create: (data: FournisseurRequest) => axiosInstance.post('/fournisseurs', data),
  update: (id: number, data: FournisseurRequest) => axiosInstance.put(`/fournisseurs/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/fournisseurs/${id}`),
  uploadPhoto: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post(`/fournisseurs/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}