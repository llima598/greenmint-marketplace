
import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

import { api } from '../services/api'
import { useCart } from '../context/useCart'
import { useAuth } from '../context/useAuth'
import PriceChangeNotice from '../components/PriceChangeNotice'

interface OrderResponse {
  id: string
  status: string
  message: string
  order: {
    items: {
      id: string
      name: string
      price: number | null
      quantity: number
    }[]
    total: number
  }
  createdAt: string
}

interface PaymentResponse {
  paymentId: string
  orderId: string
  status: string
  message: string
  simulated: boolean
  paidAt: string
}

interface CheckoutConfirmation {
  order: OrderResponse
  payment: PaymentResponse
}

interface CheckoutAttempt {
  fingerprint: string
  key: string
}

function isValidPrice(price: unknown): price is number {
  return typeof price === 'number' && Number.isFinite(price)
}

function formatETH(price: unknown): string {
  return isValidPrice(price)
    ? `${price.toFixed(2)} ETH`
    : 'Preço indisponível'
}

const PAYMENT_PENDING_ERROR = 'PAYMENT_PENDING'

function getCheckoutErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === PAYMENT_PENDING_ERROR) {
    return 'Pagamento em processamento. Aguarde alguns instantes e tente novamente: sua compra não será duplicada.'
  }

  if (axios.isAxiosError(error) && error.response?.status === 409) {
    const data = error.response.data as
      | { message?: string }
      | undefined

    if (typeof data?.message === 'string') {
      return data.message
    }
  }

  return 'Não foi possível processar o pagamento. Tente novamente.'
}

function Checkout() {
  const { items, coupon, clearCart, priceChanges } = useCart()
  const { user, token, isLoading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [confirmation, setConfirmation] =
    useState<CheckoutConfirmation | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/login' })
    }
  }, [isLoading, user, navigate])

  const hasValidPrices = items.every((item) =>
    isValidPrice(item.price),
  )

  // Enquanto houver alteração de preço não reconhecida pelo usuário, a
  // compra fica bloqueada para impedir a confirmação com cotação antiga.
  const hasPendingPriceReview = priceChanges.length > 0

  const subtotal = items.reduce((sum, item) => {
    const price = isValidPrice(item.price) ? item.price : 0

    return sum + price * item.quantity
  }, 0)

  const discount = coupon
    ? Number(
        ((subtotal * coupon.discountPercentage) / 100).toFixed(2),
      )
    : 0

  const total = Number((subtotal - discount).toFixed(2))

  const totalItems = items.reduce((sum, item) => {
    return sum + item.quantity
  }, 0)

  const checkoutMutation = useMutation({
    mutationFn: async (): Promise<CheckoutConfirmation> => {
      if (!user || !token) {
        throw new Error('Usuário não autenticado.')
      }

      if (!hasValidPrices) {
        throw new Error(
          'Existem NFTs sem preço válido no carrinho.',
        )
      }

      const cartFingerprint = JSON.stringify({
        items: items
          .map((item) => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
          }))
          .sort((a, b) => a.id.localeCompare(b.id)),
        coupon: coupon
          ? {
              code: coupon.code,
              discountPercentage: coupon.discountPercentage,
            }
          : null,
        total,
      })

      const storageKey = `greenmint-checkout-${user.id}`

      let idempotencyKey: string | undefined

      const savedAttempt = localStorage.getItem(storageKey)

      if (savedAttempt) {
        try {
          const parsed = JSON.parse(savedAttempt) as CheckoutAttempt

          if (parsed.fingerprint === cartFingerprint) {
            idempotencyKey = parsed.key
          }
        } catch {
          localStorage.removeItem(storageKey)
        }
      }

      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID()

        localStorage.setItem(
          storageKey,
          JSON.stringify({
            fingerprint: cartFingerprint,
            key: idempotencyKey,
          } satisfies CheckoutAttempt),
        )
      }

      const orderResponse = await api.post<OrderResponse>(
        '/orders',
        {
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal,
          discount,
          coupon: coupon
            ? {
                code: coupon.code,
                discountPercentage: coupon.discountPercentage,
              }
            : null,
          total,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Idempotency-Key': idempotencyKey,
          },
        },
      )

      const createdOrder = orderResponse.data
      const finalTotal = createdOrder?.order?.total

      if (!isValidPrice(finalTotal)) {
        throw new Error('A API retornou um total de pedido inválido.')
      }

      let paymentResponse

      try {
        paymentResponse = await api.post<PaymentResponse>(
          '/payments',
          {
            orderId: createdOrder.id,
            total: finalTotal,
            paymentMethod: 'ETH',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
      } catch (error) {
        // Pagamento recusado encerra o pedido (estado terminal). A próxima
        // tentativa precisa gerar uma nova chave de idempotência.
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 402
        ) {
          localStorage.removeItem(storageKey)
        }

        throw error
      }

      // Pagamento pendente: mantém a chave para que um novo envio recupere
      // o mesmo pedido em vez de criar outro.
      if (paymentResponse.data.status === 'pending') {
        throw new Error(PAYMENT_PENDING_ERROR)
      }

      if (paymentResponse.data.status !== 'approved') {
        throw new Error('O pagamento não foi aprovado.')
      }

      return {
        order: createdOrder,
        payment: paymentResponse.data,
      }
    },

    onError: (error) => {
      // Preço ou disponibilidade mudou: atualiza o catálogo para que o
      // carrinho exiba a alteração e peça uma nova confirmação.
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 409 &&
        (error.response.data as { code?: string } | undefined)?.code ===
          'PRICE_CHANGED'
      ) {
        queryClient.invalidateQueries({ queryKey: ['nfts'] })
      }
    },

    onSuccess: (data) => {
      if (user) {
        localStorage.removeItem(`greenmint-checkout-${user.id}`)
      }

      setConfirmation(data)
      clearCart()
    },
  })

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#140D0A] text-white">
        <p className="text-white/60">Verificando autenticação...</p>
      </main>
    )
  }

  if (confirmation) {
    return (
      <main className="min-h-screen bg-[#140D0A] px-6 py-12 text-white md:px-12 xl:px-[120px]">
        <section className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#241612] p-8 text-center">
          <div className="mb-6 text-5xl text-[#D9A441]">✓</div>

          <h1 className="text-3xl font-bold">
            Pedido confirmado!
          </h1>

          <p className="mt-4 text-white/60">
            {confirmation.payment.message}
          </p>

          <p className="mt-6 text-sm text-white/50">
            Número do pedido
          </p>

          <p className="mt-2 break-all font-semibold text-[#D9A441]">
            {confirmation.order.id}
          </p>

          <p className="mt-6 text-sm text-white/50">
            Identificação do pagamento
          </p>

          <p className="mt-2 break-all font-semibold text-white/80">
            {confirmation.payment.paymentId}
          </p>

          <p className="mt-6 text-lg font-bold">
            Total: {formatETH(confirmation.order.order.total)}
          </p>

          <p className="mt-4 text-xs text-white/40">
            Pagamento aprovado em{' '}
            {new Date(confirmation.payment.paidAt).toLocaleString('pt-BR')}
          </p>

          <Link
            to="/"
            search={{
              search: undefined,
              sort: undefined,
              minPrice: undefined,
              maxPrice: undefined,
              category: undefined,
              network: undefined,
              page: undefined,
            }}
            className="mt-8 inline-block rounded-full bg-[#D9A441] px-8 py-3 font-bold text-[#140D0A] transition hover:bg-[#edbd62]"
          >
            Voltar ao marketplace
          </Link>
        </section>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#140D0A] px-6 py-12 text-white md:px-12 xl:px-[120px]">
        <h1 className="text-3xl font-bold">
          Seu carrinho está vazio
        </h1>

        <p className="mt-4 text-white/60">
          Adicione NFTs ao carrinho antes de continuar.
        </p>

        <Link
          to="/"
          search={{
            search: undefined,
            sort: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            category: undefined,
            network: undefined,
            page: undefined,
          }}
          className="mt-8 inline-block rounded-full bg-[#D9A441] px-8 py-3 font-bold text-[#140D0A]"
        >
          Explorar NFTs
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#140D0A] px-6 py-12 text-white md:px-12 xl:px-[120px]">
      <Link
        to="/cart"
        className="mb-10 inline-block text-sm text-white/60 transition hover:text-[#D9A441]"
      >
        ← Voltar ao carrinho
      </Link>

      <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
        Finalizar compra
      </h1>

      <p className="mb-10 text-white/50">
        Revise seu pedido antes de continuar.
      </p>

      <PriceChangeNotice />

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
        <section className="rounded-2xl border border-white/10 bg-[#241612] p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-bold">
            Resumo dos NFTs
          </h2>

          <div className="space-y-5">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex items-center gap-4 border-b border-white/10 pb-5"
              >
                <img
                  src={`/images/nfts/${item.image}`}
                  alt={item.name}
                  className="h-20 w-20 rounded-xl bg-[#211713] object-contain p-2"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">
                    {item.name}
                  </h3>

                  <p className="mt-2 text-sm text-white/50">
                    {item.quantity} unidade(s) ×{' '}
                    {formatETH(item.price)}
                  </p>

                  <p className="mt-1 font-semibold text-[#D9A441]">
                    Subtotal:{' '}
                    {formatETH(
                      isValidPrice(item.price)
                        ? item.price * item.quantity
                        : null,
                    )}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-white/10 bg-[#241612] p-6">
          <h2 className="text-xl font-bold">
            Resumo do pedido
          </h2>

          <div className="mt-6 flex justify-between text-sm text-white/60">
            <span>Tipos de NFT</span>
            <span>{items.length}</span>
          </div>

          <div className="mt-4 flex justify-between text-sm text-white/60">
            <span>Quantidade total</span>
            <span>{totalItems}</span>
          </div>

          <div className="mt-4 flex justify-between text-sm text-white/60">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} ETH</span>
          </div>

          <div className="mt-4 flex justify-between text-sm text-white/60">
            <span>
              Desconto
              {coupon && (
                <span className="ml-1 text-[#D9A441]">
                  ({coupon.code})
                </span>
              )}
            </span>
            <span className="text-green-400">
              {discount > 0 ? `-${discount.toFixed(2)} ETH` : '—'}
            </span>
          </div>

          <div className="my-6 border-t border-white/10" />

          <div className="flex justify-between">
            <span className="font-semibold">Total</span>
            <strong className="text-xl text-[#D9A441]">
              {total.toFixed(2)} ETH
            </strong>
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-[#140D0A] p-4">
            <p className="text-sm font-semibold">
              Forma de pagamento
            </p>

            <p className="mt-2 text-sm text-white/50">
              Pagamento em ETH — simulação
            </p>
          </div>

          {!hasValidPrices && (
            <p className="mt-5 text-sm text-red-400">
              Existe pelo menos um NFT sem preço válido. Volte ao carrinho,
              remova o item indisponível e tente novamente.
            </p>
          )}

          {checkoutMutation.isError && (
            <p role="alert" className="mt-5 text-sm text-red-400">
              {getCheckoutErrorMessage(checkoutMutation.error)}
            </p>
          )}

          <button
            onClick={() => checkoutMutation.mutate()}
            disabled={
              checkoutMutation.isPending ||
              !hasValidPrices ||
              hasPendingPriceReview
            }
            className="mt-8 w-full rounded-full bg-[#D9A441] px-6 py-4 font-bold text-[#140D0A] transition hover:bg-[#edbd62] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkoutMutation.isPending
              ? 'Processando pagamento...'
              : !hasValidPrices
                ? 'Preço indisponível'
                : hasPendingPriceReview
                  ? 'Revise as alterações de preço'
                  : 'Confirmar compra'}
          </button>

          <p className="mt-5 text-xs leading-5 text-white/40">
            A confirmação do pedido acontecerá somente após a aprovação do pagamento simulado.
          </p>
        </aside>
      </div>
    </main>
  )
}

export default Checkout
