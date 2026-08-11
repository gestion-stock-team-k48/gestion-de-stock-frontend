import { axiosInstance } from '../../../core/api/axiosInstance'
import type { ClientRequest } from '../types'

export const clientsApi = {
  getAll: () => axiosInstance.get('/api/clients'),
  getById: (id: number) => axiosInstance.get(`/api/clients/${id}`),
  create: (data: ClientRequest) => axiosInstance.post('/api/clients', data),
  update: (id: number, data: ClientRequest) => axiosInstance.put(`/api/clients/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/api/clients/${id}`),
  uploadPhoto: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post(`/api/clients/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}