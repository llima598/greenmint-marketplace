
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { NFT } from '../data/nfts'
import { useAuth } from './useAuth'
import { CartContext } from './CartContextDefinition'

interface CartProviderProps {
  children: ReactNode
}

interface CartState {
  key: string
  items: NFT[]
}

function readCart(storageKey: string): NFT[] {
  try {
    const savedCart = localStorage.getItem(storageKey)

    if (!savedCart) {
      return []
    }

    const parsedCart: unknown = JSON.parse(savedCart)

    return Array.isArray(parsedCart) ? (parsedCart as NFT[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: CartProviderProps) {
  const { user, isLoading } = useAuth()

  const storageKey = user
    ? `greenmint-cart-${user.id}`
    : 'greenmint-cart-guest'

  const [cartState, setCartState] = useState<CartState>({
    key: '',
    items: [],
  })

  const items = useMemo(() => {
    if (cartState.key === storageKey) {
      return cartState.items
    }

    return readCart(storageKey)
  }, [cartState, storageKey])

  useEffect(() => {
    if (isLoading) {
      return
    }

    localStorage.setItem(storageKey, JSON.stringify(items))
  }, [items, storageKey, isLoading])

  function addToCart(nft: NFT) {
    setCartState((currentState) => {
      const currentItems =
        currentState.key === storageKey
          ? currentState.items
          : readCart(storageKey)

      const alreadyExists = currentItems.some(
        (item) => item.id === nft.id,
      )

      if (alreadyExists) {
        return {
          key: storageKey,
          items: currentItems,
        }
      }

      return {
        key: storageKey,
        items: [...currentItems, nft],
      }
    })
  }

  function removeFromCart(nftId: string) {
    setCartState((currentState) => {
      const currentItems =
        currentState.key === storageKey
          ? currentState.items
          : readCart(storageKey)

      return {
        key: storageKey,
        items: currentItems.filter((item) => item.id !== nftId),
      }
    })
  }

  function clearCart() {
    setCartState({
      key: storageKey,
      items: [],
    })
  }

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}
