import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { api } from '../services/api'
import { useAuth } from './useAuth'
import {
  FavoritesContext,
} from './FavoritesContextDefinition'

interface FavoritesProviderProps {
  children: ReactNode
}

export function FavoritesProvider({
  children,
}: FavoritesProviderProps) {
  const { user, token } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true

    async function loadFavorites() {
      if (!user || !token) {
        setFavoriteIds([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const response = await api.get<string[]>('/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (active) {
          setFavoriteIds(
            Array.isArray(response.data) ? response.data : [],
          )
        }
      } catch {
        if (active) setFavoriteIds([])
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadFavorites()

    return () => {
      active = false
    }
  }, [user?.id, token])

  const isFavorite = useCallback(
    (nftId: string) => favoriteIds.includes(nftId),
    [favoriteIds],
  )

  const toggleFavorite = useCallback(async (nftId: string) => {
    if (!user || !token) return

    const wasFavorite = favoriteIds.includes(nftId)

    setFavoriteIds((current) =>
      wasFavorite
        ? current.filter((id) => id !== nftId)
        : [...current, nftId],
    )

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      }

      if (wasFavorite) {
        await api.delete(`/favorites/${encodeURIComponent(nftId)}`, config)
      } else {
        await api.post('/favorites', { nftId }, config)
      }
    } catch {
      setFavoriteIds((current) =>
        wasFavorite
          ? [...current, nftId]
          : current.filter((id) => id !== nftId),
      )
      throw new Error('Não foi possível atualizar seus favoritos.')
    }
  }, [favoriteIds, token, user])

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, isLoading, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}
