import { axiosInstance } from '../../../core/api/axiosInstance'
import type { FournisseurRequest } from '../types'

export const fournisseursApi = {
  getAll: () => axiosInstance.get('/api/fournisseurs'),
  getById: (id: number) => axiosInstance.get(`/api/fournisseurs/${id}`),
  create: (data: FournisseurRequest) => axiosInstance.post('/api/fournisseurs', data),
  update: (id: number, data: FournisseurRequest) => axiosInstance.put(`/api/fournisseurs/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/api/fournisseurs/${id}`),
  uploadPhoto: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post(`/api/fournisseurs/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}