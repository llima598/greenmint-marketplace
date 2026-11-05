
import { useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { api } from '../services/api'
import { useAuth } from '../context/useAuth'

interface Order {
  id: string
  userId: string
  status: 'pending' | 'confirmed' | 'rejected'
  items: {
    id: string
    name: string
    price: number | null
  }[]
  total: number
  createdAt: string
  paymentId?: string
  paidAt?: string
}

function Orders() {
  const { user, token, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/login' })
    }
  }, [isLoading, user, navigate])

  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError,
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const response = await api.get<Order[]>('/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    },
    enabled: Boolean(token) && !isLoading,
  })

  if (isLoading || !user) {
    return null
  }

  return (
    <main className="min-h-screen bg-[#140D0A] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
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
          className="text-sm text-[#B7A99A] transition hover:text-white"
        >
          ← Voltar para a loja
        </Link>

        <h1 className="mt-8 text-3xl font-bold">
          Meus pedidos
        </h1>

        <p className="mt-2 text-[#B7A99A]">
          Acompanhe suas compras na GreenMint.
        </p>

        {isLoadingOrders && (
          <p className="mt-10 text-[#B7A99A]">
            Carregando seus pedidos...
          </p>
        )}

        {isError && (
          <p className="mt-10 text-red-400">
            Não foi possível carregar seus pedidos.
          </p>
        )}

        {!isLoadingOrders && !isError && orders?.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-xl font-semibold">
              Você ainda não fez nenhum pedido.
            </h2>

            <p className="mt-2 text-[#B7A99A]">
              Explore a coleção e encontre seu próximo NFT.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-5">
          {orders?.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#B7A99A]">
                    Pedido
                  </p>

                  <p className="mt-1 break-all font-mono text-sm">
                    {order.id}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    order.status === 'confirmed'
                      ? 'bg-green-500/15 text-green-400'
                      : order.status === 'pending'
                        ? 'bg-yellow-500/15 text-yellow-400'
                        : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {order.status === 'confirmed'
                    ? 'Confirmado'
                    : order.status === 'pending'
                      ? 'Aguardando pagamento'
                      : 'Rejeitado'}
                </span>
              </div>

              <p className="mt-4 text-sm text-[#B7A99A]">
                Data: {new Date(order.createdAt).toLocaleString('pt-BR')}
              </p>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="mb-3 font-semibold">
                  Itens do pedido
                </p>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap justify-between gap-2 text-sm"
                    >
                      <span>{item.name}</span>

                      <span className="text-[#B7A99A]">
                        {item.price != null
                          ? `${item.price.toFixed(2)} ETH`
                          : 'Preço indisponível'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex justify-between border-t border-white/10 pt-4">
                <span className="font-semibold">Total</span>

                <span className="font-bold text-[#C6A66B]">
                  {order.total.toFixed(2)} ETH
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

export default Orders
