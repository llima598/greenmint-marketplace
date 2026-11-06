
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { NFT } from '../data/nfts'
import {
  CartContext,
  type AppliedCoupon,
  type CartItem,
} from './CartContextDefinition'
import { useAuth } from './useAuth'

interface CartProviderProps {
  children: ReactNode
}

interface CartState {
  key: string
  items: CartItem[]
  coupon: AppliedCoupon | null
}

function normalizeCart(items: unknown): CartItem[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .filter(
      (item): item is NFT =>
        item !== null &&
        typeof item === 'object' &&
        typeof item.id === 'string',
    )
    .map((item) => {
      const savedItem = item as NFT & {
        quantity?: number
      }

      return {
        ...savedItem,
        quantity:
          Number.isInteger(savedItem.quantity) &&
          savedItem.quantity! > 0
            ? savedItem.quantity!
            : 1,
      }
    })
}

function readCart(storageKey: string): CartItem[] {
  try {
    const savedCart = localStorage.getItem(storageKey)

    if (!savedCart) {
      return []
    }

    const parsedCart: unknown = JSON.parse(savedCart)

    return normalizeCart(parsedCart)
  } catch {
    return []
  }
}

function readCoupon(storageKey: string): AppliedCoupon | null {
  try {
    const savedCoupon = localStorage.getItem(storageKey)

    if (!savedCoupon) {
      return null
    }

    const parsedCoupon: unknown = JSON.parse(savedCoupon)

    if (
      parsedCoupon === null ||
      typeof parsedCoupon !== 'object'
    ) {
      return null
    }

    const coupon = parsedCoupon as AppliedCoupon

    if (
      typeof coupon.code !== 'string' ||
      typeof coupon.discountPercentage !== 'number' ||
      coupon.discountPercentage <= 0 ||
      coupon.discountPercentage > 100
    ) {
      return null
    }

    return coupon
  } catch {
    return null
  }
}

export function CartProvider({
  children,
}: CartProviderProps) {
  const { user, isLoading } = useAuth()

  const storageKey = user
    ? `greenmint-cart-${user.id}`
    : 'greenmint-cart-guest'

  const couponStorageKey = user
    ? `greenmint-coupon-${user.id}`
    : 'greenmint-coupon-guest'

  const [cartState, setCartState] = useState<CartState>({
    key: '',
    items: [],
    coupon: null,
  })

  const items = useMemo(() => {
    if (cartState.key === storageKey) {
      return cartState.items
    }

    return readCart(storageKey)
  }, [cartState, storageKey])

  const coupon = useMemo(() => {
    if (cartState.key === storageKey) {
      return cartState.coupon
    }

    return readCoupon(couponStorageKey)
  }, [cartState, storageKey, couponStorageKey])

  useEffect(() => {
    if (isLoading) {
      return
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify(items),
    )
  }, [items, storageKey, isLoading])

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (coupon) {
      localStorage.setItem(
        couponStorageKey,
        JSON.stringify(coupon),
      )
    } else {
      localStorage.removeItem(couponStorageKey)
    }
  }, [coupon, couponStorageKey, isLoading])

  function addToCart(nft: NFT) {
    setCartState((currentState) => {
      const currentItems =
        currentState.key === storageKey
          ? currentState.items
          : readCart(storageKey)

      const currentCoupon =
        currentState.key === storageKey
          ? currentState.coupon
          : readCoupon(couponStorageKey)

      const existingItem = currentItems.find(
        (item) => item.id === nft.id,
      )

      if (existingItem) {
        return {
          key: storageKey,
          items: currentItems.map((item) =>
            item.id === nft.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          ),
          coupon: currentCoupon,
        }
      }

      return {
        key: storageKey,
        items: [
          ...currentItems,
          {
            ...nft,
            quantity: 1,
          },
        ],
        coupon: currentCoupon,
      }
    })
  }

  function removeFromCart(nftId: string) {
    setCartState((currentState) => {
      const currentItems =
        currentState.key === storageKey
          ? currentState.items
          : readCart(storageKey)

      const currentCoupon =
        currentState.key === storageKey
          ? currentState.coupon
          : readCoupon(couponStorageKey)

      return {
        key: storageKey,
        items: currentItems.filter(
          (item) => item.id !== nftId,
        ),
        coupon: currentCoupon,
      }
    })
  }

  function updateQuantity(
    nftId: string,
    quantity: number,
  ) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return
    }

    setCartState((currentState) => {
      const currentItems =
        currentState.key === storageKey
          ? currentState.items
          : readCart(storageKey)

      const currentCoupon =
        currentState.key === storageKey
          ? currentState.coupon
          : readCoupon(couponStorageKey)

      return {
        key: storageKey,
        items: currentItems.map((item) =>
          item.id === nftId
            ? {
                ...item,
                quantity,
              }
            : item,
        ),
        coupon: currentCoupon,
      }
    })
  }

  function setCoupon(newCoupon: AppliedCoupon | null) {
    setCartState((currentState) => ({
      key: storageKey,
      items:
        currentState.key === storageKey
          ? currentState.items
          : readCart(storageKey),
      coupon: newCoupon,
    }))
  }

  function clearCart() {
    setCartState({
      key: storageKey,
      items: [],
      coupon: null,
    })
  }

  return (
    <CartContext.Provider
      value={{
        items,
        coupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        setCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
