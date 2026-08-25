import axios from 'axios'

import i18n, { DEFAULT_LANGUAGE } from '../../i18n/i18n'

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  const language = i18n.language || DEFAULT_LANGUAGE
  const publicAuthPaths = [
    '/auth/authenticate',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ]
  const requestUrl = config.url ?? ''

  config.headers.set('Accept-Language', language)

  if (token && !publicAuthPaths.some((path) => requestUrl.includes(path))) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

export default axiosInstance
