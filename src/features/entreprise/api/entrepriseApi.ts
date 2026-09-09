import { axiosInstance } from '../../../core/api/axiosInstance'
import type { EntrepriseRequest, EntrepriseResponse } from '../types'

export const entrepriseApi = {
  getEntreprise: () => axiosInstance.get<EntrepriseResponse>('/entreprises/me'),
  updateEntreprise: (data: EntrepriseRequest) =>
    axiosInstance.put<EntrepriseResponse>('/entreprises/me', data),
}
