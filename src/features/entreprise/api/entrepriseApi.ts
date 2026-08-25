import { axiosInstance } from '../../../core/api/axiosInstance'
import type { EntrepriseRequest } from '../types'

export const entrepriseApi = {
  getEntreprise: () => axiosInstance.get('/entreprises/me'),
  updateEntreprise: (data: EntrepriseRequest) => axiosInstance.put('/entreprises/me', data),
}