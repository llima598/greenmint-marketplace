
import { createContext } from 'react'
import type { NFT } from '../data/nfts'

export interface CartContextType {
  items: NFT[]
  addToCart: (nft: NFT) => void
  removeFromCart: (nftId: string) => void
  clearCart: () => void
}

export const CartContext = createContext<
  CartContextType | undefined
>(undefined)
