
import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'

import { api } from '../services/api'
import { useCart } from '../context/useCart'
import { useAuth } from '../context/useAuth'

interface OrderResponse {
  id: string
  status: string
  message: string
  order: {
    items: {
      id: string
      name: string
      price: number | null
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

function Checkout() {
  const { items, clearCart } = useCart()
  const { user, token, isLoading } = useAuth()
  const navigate = useNavigate()

  const [confirmation, setConfirmation] =
    useState<CheckoutConfirmation | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/login' })
    }
  }, [isLoading, user, navigate])

  const total = items.reduce((sum, item) => {
    return sum + (item.price ?? 0)
  }, 0)

  const checkoutMutation = useMutation({
    mutationFn: async (): Promise<CheckoutConfirmation> => {
      if (!user || !token) {
        throw new Error('Usuário não autenticado.')
      }

      const cartFingerprint = JSON.stringify(
        items
          .map((item) => ({
            id: item.id,
            price: item.price,
          }))
          .sort((a, b) => a.id.localeCompare(b.id)),
      )

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
          })),
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

      const paymentResponse = await api.post<PaymentResponse>(
        '/payments',
        {
          orderId: createdOrder.id,
          total,
          paymentMethod: 'ETH',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (paymentResponse.data.status !== 'approved') {
        throw new Error('O pagamento não foi aprovado.')
      }

      return {
        order: createdOrder,
        payment: paymentResponse.data,
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
            Total: {confirmation.order.order.total.toFixed(2)} ETH
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

                <div className="flex-1">
                  <h3 className="font-semibold">
                    {item.name}
                  </h3>

                  <p className="mt-2 text-sm text-[#D9A441]">
                    {item.price?.toFixed(2)} ETH
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
            <span>Quantidade de NFTs</span>
            <span>{items.length}</span>
          </div>

          <div className="mt-4 flex justify-between text-sm text-white/60">
            <span>Subtotal</span>
            <span>{total.toFixed(2)} ETH</span>
          </div>

          <div className="mt-4 flex justify-between text-sm text-white/60">
            <span>Desconto</span>
            <span>—</span>
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

          {checkoutMutation.isError && (
            <p className="mt-5 text-sm text-red-400">
              Não foi possível processar o pagamento. Tente novamente.
            </p>
          )}

          <button
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending}
            className="mt-8 w-full rounded-full bg-[#D9A441] px-6 py-4 font-bold text-[#140D0A] transition hover:bg-[#edbd62] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkoutMutation.isPending
              ? 'Processando pagamento...'
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
