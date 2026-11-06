
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQuery } from '@tanstack/react-query'

import type { NFT } from '../data/nfts'
import { fetchNfts } from '../services/nfts'
import {
  CartContext,
  type AppliedCoupon,
  type CartItem,
  type PriceChange,
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

interface PriceChangeState {
  key: string
  changes: PriceChange[]
}

function normalizePrice(price: unknown): number | null {
  return typeof price === 'number' && Number.isFinite(price)
    ? price
    : null
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
        price: normalizePrice(savedItem.price),
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
      !Number.isFinite(coupon.discountPercentage) ||
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

  const [priceChangeState, setPriceChangeState] =
    useState<PriceChangeState>({ key: '', changes: [] })

  // Só exibe alterações do carrinho atual e de itens que ainda estão nele.
  const priceChanges = useMemo(() => {
    if (priceChangeState.key !== storageKey) {
      return []
    }

    return priceChangeState.changes.filter((change) =>
      items.some((item) => item.id === change.id),
    )
  }, [priceChangeState, storageKey, items])

  // Mesmo cache ['nfts'] do catálogo: eventos `nft.updated` do Socket.IO,
  // invalidações na reconexão e refetch após conflito de preço no checkout
  // passam por aqui e atualizam o carrinho.
  const { data: catalog } = useQuery({
    queryKey: ['nfts'],
    queryFn: fetchNfts,
  })

  useEffect(() => {
    if (isLoading || !catalog || items.length === 0) {
      return
    }

    const detected: PriceChange[] = []

    for (const item of items) {
      const latest = catalog.find((nft) => nft.id === item.id)

      if (!latest) {
        continue
      }

      const latestPrice = normalizePrice(latest.price)

      if (latestPrice !== item.price) {
        detected.push({
          id: item.id,
          name: item.name,
          previousPrice: item.price,
          currentPrice: latestPrice,
        })
      }
    }

    if (detected.length === 0) {
      return
    }

    const latestById = new Map(
      detected.map((change) => [change.id, change.currentPrice]),
    )

    // O efeito sincroniza o carrinho (estado local) com o cache de NFTs
    // do TanStack Query, que é atualizado por eventos do Socket.IO.
    // oxlint-disable-next-line react/set-state-in-effect
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
          latestById.has(item.id)
            ? { ...item, price: latestById.get(item.id) ?? null }
            : item,
        ),
        coupon: currentCoupon,
      }
    })

    setPriceChangeState((currentState) => {
      const previous =
        currentState.key === storageKey ? currentState.changes : []

      const merged = new Map(
        previous.map((change) => [change.id, change]),
      )

      for (const change of detected) {
        const existing = merged.get(change.id)

        // Mantém o primeiro preço visto pelo usuário (A → B → C vira A → C).
        merged.set(change.id, {
          ...change,
          previousPrice: existing
            ? existing.previousPrice
            : change.previousPrice,
        })
      }

      return {
        key: storageKey,
        changes: Array.from(merged.values()),
      }
    })
  }, [catalog, items, isLoading, storageKey, couponStorageKey])

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
    const normalizedNFT = {
      ...nft,
      price: normalizePrice(nft.price),
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

      const existingItem = currentItems.find(
        (item) => item.id === normalizedNFT.id,
      )

      if (existingItem) {
        return {
          key: storageKey,
          items: currentItems.map((item) =>
            item.id === normalizedNFT.id
              ? {
                  ...item,
                  price: normalizedNFT.price,
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
            ...normalizedNFT,
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

    setPriceChangeState({ key: storageKey, changes: [] })
  }

  function acknowledgePriceChanges() {
    setPriceChangeState({ key: storageKey, changes: [] })
  }

  return (
    <CartContext.Provider
      value={{
        items,
        coupon,
        priceChanges,
        addToCart,
        removeFromCart,
        updateQuantity,
        setCoupon,
        clearCart,
        acknowledgePriceChanges,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
