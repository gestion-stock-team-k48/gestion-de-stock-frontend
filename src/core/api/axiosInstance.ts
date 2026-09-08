import axios from 'axios'

import i18n, { DEFAULT_LANGUAGE } from '../../i18n/i18n'

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'

const API_BASE_URL = '/api/v1'

export const axiosInstance = axios.create({
  // En dev, '/api/v1' passe par le proxy Vite (évite les erreurs CORS).
  // En production, définir VITE_API_BASE_URL vers l'URL complète de l'API.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Empêcher les refresh tokens en boucle
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si 401 et que ce n'est pas déjà une retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)

      // Si on n'a pas de refresh token → déconnexion directe
      if (!refreshToken) {
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      // Si déjà en train de refresh, mettre en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? API_BASE_URL}/auth/refresh-token`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        )

        const newToken = data.token as string
        const newRefreshToken = data.refreshToken as string

        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, newToken)
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken)

        processQueue(null, newToken)

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
