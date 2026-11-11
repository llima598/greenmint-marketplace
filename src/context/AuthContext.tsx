
import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { api } from '../services/api'
import {
  AuthContext,
  type AuthResponse,
  type User,
} from './AuthContextDefinition'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('greenmint-token')
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    function handleSessionExpired() {
      localStorage.removeItem('greenmint-token')
      setToken(null)
      setUser(null)
      queryClient.clear()
    }

    window.addEventListener('greenmint:session-expired', handleSessionExpired)
    return () => window.removeEventListener('greenmint:session-expired', handleSessionExpired)
  }, [queryClient])

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.get<User>('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUser(response.data)
      } catch {
        localStorage.removeItem('greenmint-token')
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [token])

  async function login(email: string, password: string) {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    })

    // Troca de usuário: descarta dados privados do usuário anterior.
    queryClient.removeQueries({ queryKey: ['orders'] })

    localStorage.setItem('greenmint-token', response.data.token)

    setToken(response.data.token)
    setUser(response.data.user)
  }

  async function register(
    name: string,
    email: string,
    password: string,
  ) {
    const response = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    })

    localStorage.setItem('greenmint-token', response.data.token)

    setToken(response.data.token)
    setUser(response.data.user)
  }

  async function updateProfile(name: string, email: string) {
    if (!token) {
      throw new Error('Sessão inválida ou expirada.')
    }

    const response = await api.patch<User>(
      '/auth/profile',
      { name, email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    setUser(response.data)
    queryClient.setQueryData(['profile', response.data.id], response.data)
  }

  async function updatePassword(
    currentPassword: string,
    newPassword: string,
  ) {
    if (!token) {
      throw new Error('Sessão inválida ou expirada.')
    }

    await api.patch(
      '/auth/password',
      { currentPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
  }

  async function logout() {
    const currentToken = token

    try {
      if (currentToken) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${currentToken}` },
        })
      }
    } catch {
      // O estado local também precisa ser encerrado se o servidor estiver indisponível.
    } finally {
      localStorage.removeItem('greenmint-token')
      setToken(null)
      setUser(null)
      queryClient.clear()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        updateProfile,
        updatePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
