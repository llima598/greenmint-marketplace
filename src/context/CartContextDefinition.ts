import { createContext } from 'react'
import type { NFT } from '../data/nfts'

export interface CartItem extends NFT {
  quantity: number
}

export interface AppliedCoupon {
  code: string
  discountPercentage: number
}

export interface CartContextType {
  items: CartItem[]
  coupon: AppliedCoupon | null
  addToCart: (nft: NFT) => void
  removeFromCart: (nftId: string) => void
  updateQuantity: (nftId: string, quantity: number) => void
  setCoupon: (coupon: AppliedCoupon | null) => void
  clearCart: () => void
}

export const CartContext = createContext<
  CartContextType | undefined
>(undefined)