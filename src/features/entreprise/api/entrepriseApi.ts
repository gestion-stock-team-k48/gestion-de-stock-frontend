import { axiosInstance } from '../../../core/api/axiosInstance'
import type { EntrepriseRequest } from '../types'

export const entrepriseApi = {
  getEntreprise: () => axiosInstance.get('/api/entreprises/me'),
  updateEntreprise: (data: EntrepriseRequest) => axiosInstance.put('/api/entreprises/me', data),
}