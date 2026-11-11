
import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { api } from '../services/api'
import type { NFT } from '../data/nfts'
import { useCart } from '../context/useCart'
import FavoriteButton from '../components/FavoriteButton'

function NftDetails() {
  const { nftId } = useParams({
    from: '/nft/$nftId',
  })

  const { addToCart, items } = useCart()

  const {
    data: nft,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['nfts', nftId],
    queryFn: async () => {
      const response = await api.get<NFT>(`/nfts/${nftId}`)
      return response.data
    },
    retry: false,
  })

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#140D0A] px-6 py-12 text-white">
        <p className="text-white/60">Carregando NFT...</p>
      </main>
    )
  }

  if (isError) {
    const notFound =
      axios.isAxiosError(error) && error.response?.status === 404

    return (
      <main className="min-h-screen bg-[#140D0A] px-6 py-12 text-white">
        <h1 className="text-3xl font-bold">
          {notFound
            ? 'NFT não encontrado'
            : 'Não foi possível carregar o NFT'}
        </h1>

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
          className="mt-6 inline-block text-[#D9A441] hover:underline"
        >
          Voltar ao marketplace
        </Link>
      </main>
    )
  }

  if (!nft) {
    return null
  }

  const price = nft.price

  const hasValidPrice =
    typeof price === 'number' && Number.isFinite(price)

  const formattedPrice =
    typeof price === 'number' && Number.isFinite(price)
      ? `${price.toFixed(2)} ETH`
      : 'Preço não informado'

  const alreadyInCart = items.some(
    (item) => item.id === nft.id,
  )

  return (
    <main className="min-h-screen bg-[#140D0A] px-6 py-12 text-white md:px-12 xl:px-[120px]">
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
        className="mb-10 inline-block text-sm text-white/60 transition hover:text-[#D9A441]"
      >
        ← Voltar ao marketplace
      </Link>

      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-[#211713] p-8">
          <img
            src={`/images/nfts/${nft.image}`}
            alt={nft.name}
            className="h-full w-full object-contain"
          />
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#D9A441]">
            Marketplace / NFT
          </p>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold sm:text-4xl">
              {nft.name}
            </h1>
            <FavoriteButton nftId={nft.id} className="shrink-0" />
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#241612] p-6">
            <p className="text-sm text-white/50">Preço atual</p>

            <p className="mt-2 text-3xl font-bold text-[#D9A441]">
              {formattedPrice}
            </p>
          </div>

          {!hasValidPrice ? (
            <button
              disabled
              className="mt-8 w-full cursor-not-allowed rounded-full bg-[#D9A441] px-8 py-4 font-bold text-[#140D0A] opacity-40"
            >
              Indisponível para compra
            </button>
          ) : alreadyInCart ? (
            <div className="mt-8 space-y-3">
              <Link
                to="/cart"
                className="block w-full rounded-full bg-[#D9A441] px-8 py-4 text-center font-bold text-[#140D0A] transition hover:bg-[#edbd62]"
              >
                Ir para o carrinho
              </Link>

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
                className="block w-full rounded-full border border-white/20 px-8 py-4 text-center font-semibold text-white transition hover:border-[#D9A441] hover:text-[#D9A441]"
              >
                Continuar explorando
              </Link>
            </div>
          ) : (
            <button
              onClick={() => addToCart(nft)}
              className="mt-8 w-full rounded-full bg-[#D9A441] px-8 py-4 font-bold text-[#140D0A] transition hover:bg-[#edbd62]"
            >
              Adicionar ao carrinho
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

export default NftDetails