
import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !['/auth/login', '/auth/register', '/auth/me', '/auth/logout'].some(
        (path) => error.config?.url?.includes(path),
      ) &&
      typeof window !== 'undefined'
    ) {
      window.dispatchEvent(new Event('greenmint:session-expired'))
    }

    return Promise.reject(error)
  },
)
