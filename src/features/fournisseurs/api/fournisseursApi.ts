import { axiosInstance } from '../../../core/api/axiosInstance'
import type { FournisseurRequest } from '../types'

export const fournisseursApi = {
  getAll: () => axiosInstance.get('/fournisseurs'),
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