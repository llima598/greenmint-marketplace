import { createContext } from 'react'
import type { NFT } from '../data/nfts'

export interface CartItem extends NFT {
  quantity: number
}

export interface AppliedCoupon {
  code: string
  discountPercentage: number
}

// Alteração de preço ou disponibilidade detectada em um item do carrinho.
// currentPrice === null significa que o NFT ficou indisponível.
export interface PriceChange {
  id: string
  name: string
  previousPrice: number | null
  currentPrice: number | null
}

export interface CartContextType {
  items: CartItem[]
  coupon: AppliedCoupon | null
  // Alterações ainda não reconhecidas pelo usuário. Enquanto existirem,
  // o checkout não pode ser confirmado.
  priceChanges: PriceChange[]
  addToCart: (nft: NFT) => void
  removeFromCart: (nftId: string) => void
  updateQuantity: (nftId: string, quantity: number) => void
  setCoupon: (coupon: AppliedCoupon | null) => void
  clearCart: () => void
  acknowledgePriceChanges: () => void
}

export const CartContext = createContext<
  CartContextType | undefined
>(undefined)
