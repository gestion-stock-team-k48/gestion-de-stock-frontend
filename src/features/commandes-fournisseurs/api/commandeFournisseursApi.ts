import { axiosInstance } from '../../../core/api/axiosInstance'
import type { CommandeFournisseurRequest, CommandeFournisseurResponse } from '../types'
import type { PageResponse } from '../../../core/types'
import type { EtatCommande } from '../../../core/types/index'

type PageableParams = {
  page?: number
  size?: number
  sort?: string[]
}

export const commandeFournisseursApi = {
  getAll: (params: PageableParams = { page: 0, size: 100 }) =>
    axiosInstance.get<PageResponse<CommandeFournisseurResponse>>('/commandes-fournisseur', { params }),
  getById: (id: number) => axiosInstance.get<CommandeFournisseurResponse>(`/commandes-fournisseur/${id}`),
  getHistoric: (idFournisseur: number) => axiosInstance.get<PageResponse<CommandeFournisseurResponse>>(`/commandes-fournisseur/fournisseur/${idFournisseur}`),
  create: (data: CommandeFournisseurRequest) => axiosInstance.post<CommandeFournisseurResponse>('/commandes-fournisseur', data),
  update: (id: number, data: CommandeFournisseurRequest) => axiosInstance.put<CommandeFournisseurResponse>(`/commandes-fournisseur/${id}`, data),
  updateEtat: (id: number, etatCommande: EtatCommande) =>
    axiosInstance.patch<CommandeFournisseurResponse>(`/commandes-fournisseur/${id}/etat`, { etatCommande }),
  delete: (id: number) => axiosInstance.delete(`/commandes-fournisseur/${id}`),
}