import { createContext } from 'react'

export interface FavoritesContextType {
  favoriteIds: string[]
  isLoading: boolean
  isFavorite: (nftId: string) => boolean
  toggleFavorite: (nftId: string) => Promise<void>
}

export const FavoritesContext = createContext<
  FavoritesContextType | undefined
>(undefined)
