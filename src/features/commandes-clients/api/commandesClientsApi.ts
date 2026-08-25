import { axiosInstance } from '../../../core/api/axiosInstance'
import type { CommandeClientRequest, CommandeClientResponse } from '../types'
import type { PageResponse } from '../../../core/types'
import type { EtatCommande } from '../../../core/types/index';

type PageableParams = {
  page?: number
  size?: number
  sort?: string[]
}

export const commandeClientsApi = {
  getAll: (params: PageableParams = { page: 0, size: 100 }) =>
    axiosInstance.get<PageResponse<CommandeClientResponse>>('/commandes-client', { params }),
  getById: (id: number) => axiosInstance.get<CommandeClientResponse>(`/commandes-client/${id}`),
  getHistoric: (idClient: number) => axiosInstance.get<PageResponse<CommandeClientResponse>>(`/commandes-client/client/${idClient}`),
  create: (data: CommandeClientRequest) => axiosInstance.post<CommandeClientResponse>('/commandes-client', data),
  update: (id: number, data: CommandeClientRequest) => axiosInstance.put<CommandeClientResponse>(`/commandes-client/${id}`, data),
  updateEtat: (id: number, etatCommande: EtatCommande) =>
    axiosInstance.patch<CommandeClientResponse>(`/commandes-client/${id}/etat`, { etatCommande }),
  delete: (id: number) => axiosInstance.delete(`/commandes-client/${id}`),
}