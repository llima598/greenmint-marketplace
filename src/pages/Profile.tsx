
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { api } from '../services/api'
import { useAuth } from '../context/useAuth'

interface Order {
  id: string
  status: 'pending' | 'confirmed' | 'rejected'
  items: {
    id: string
    name: string
    price: number | null
  }[]
  total: number
  createdAt: string
}

function isValidPrice(price: unknown): price is number {
  return typeof price === 'number' && Number.isFinite(price)
}

function formatETH(price: unknown): string {
  return isValidPrice(price)
    ? `${price.toFixed(2)} ETH`
    : 'Preço indisponível'
}

function Profile() {
  const { user, token } = useAuth()

  const {
    data: orders,
    isLoading,
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
    enabled: Boolean(user && token),
  })

  if (!user) {
    return null
  }

  const confirmedOrders =
    orders?.filter((order) => order.status === 'confirmed') ?? []

  const purchasedNFTs = confirmedOrders.flatMap(
    (order) => order.items,
  )

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
          Meu perfil
        </h1>

        <p className="mt-2 text-[#B7A99A]">
          Gerencie sua conta e acompanhe sua coleção.
        </p>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">
            Informações da conta
          </h2>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-[#B7A99A]">
                Nome
              </p>
              <p className="mt-1 font-medium">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#B7A99A]">
                E-mail
              </p>
              <p className="mt-1 font-medium">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              Minha coleção
            </h2>

            <span className="rounded-full bg-[#D9A441]/15 px-3 py-1 text-sm text-[#D9A441]">
              {purchasedNFTs.length} NFTs
            </span>
          </div>

          {isLoading && (
            <p className="mt-5 text-sm text-[#B7A99A]">
              Carregando sua coleção...
            </p>
          )}

          {isError && (
            <p className="mt-5 text-sm text-red-400">
              Não foi possível carregar sua coleção.
            </p>
          )}

          {!isLoading && !isError && purchasedNFTs.length === 0 && (
            <p className="mt-5 text-sm text-[#B7A99A]">
              Você ainda não possui NFTs adquiridos.
            </p>
          )}

          {!isLoading && !isError && purchasedNFTs.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {purchasedNFTs.map((nft, index) => (
                <article
                  key={`${nft.id}-${index}`}
                  className="rounded-xl border border-white/10 bg-black/20 p-5"
                >
                  <h3 className="font-semibold">
                    {nft.name}
                  </h3>

                  <p className="mt-2 text-sm text-[#B7A99A]">
                    {formatETH(nft.price)}
                  </p>

                  <span className="mt-4 inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                    Adquirido
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">
            Carteira digital
          </h2>

          <p className="mt-3 text-sm text-[#B7A99A]">
            Nenhuma carteira conectada.
          </p>

          <button
            type="button"
            disabled
            className="mt-5 cursor-not-allowed rounded-full border border-white/20 px-5 py-2 text-sm text-white/40"
          >
            Conectar carteira
          </button>

          <p className="mt-3 text-xs text-white/40">
            Integração de carteira será implementada posteriormente.
          </p>
        </section>
      </div>
    </main>
  )
}

export default Profile
