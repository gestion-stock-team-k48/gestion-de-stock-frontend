import { axiosInstance } from '../../../core/api/axiosInstance'
import type { PageResponse } from '../../../core/types'
import type { ClientRequest, ClientResponse } from '../types'

type PageableParams = {
  page?: number
  size?: number
  sort?: string[]
}

export const clientsApi = {
  getAll: (params: PageableParams = { page: 0, size: 100 }) =>
    axiosInstance.get<PageResponse<ClientResponse>>('/clients', { params }),
  getById: (id: number) => axiosInstance.get<ClientResponse>(`/clients/${id}`),
  create: (data: ClientRequest) => axiosInstance.post<ClientResponse>('/clients', data),
  update: (id: number, data: ClientRequest) => axiosInstance.put<ClientResponse>(`/clients/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/clients/${id}`),
  uploadPhoto: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosInstance.post(`/clients/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
