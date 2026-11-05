
import { createContext } from 'react'

export interface User {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<
  AuthContextType | undefined
>(undefined)
