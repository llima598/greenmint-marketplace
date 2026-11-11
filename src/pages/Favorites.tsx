import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '../context/useAuth'
import { useFavorites } from '../context/useFavorites'
import { fetchNfts } from '../services/nfts'
import FavoriteButton from '../components/FavoriteButton'

function Favorites() {
  const { user } = useAuth()
  const { favoriteIds, isLoading: favoritesLoading } = useFavorites()

  const {
    data: nfts = [],
    isLoading: nftsLoading,
    isError,
  } = useQuery({
    queryKey: ['nfts'],
    queryFn: fetchNfts,
  })

  if (!user) return null

  const favorites = nfts.filter((nft) => favoriteIds.includes(nft.id))
  const isLoading = favoritesLoading || nftsLoading

  return (
    <main className="min-h-screen bg-[#140D0A] px-4 py-10 text-white md:px-12 xl:px-[120px]">
      <div className="mx-auto max-w-6xl">
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

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-[#D9A441]">
          Sua coleção pessoal
        </p>
        <h1 className="mt-2 text-3xl font-bold">Meus favoritos</h1>
        <p className="mt-2 text-[#B7A99A]">
          NFTs que você salvou para consultar depois.
        </p>

        {isLoading && (
          <p className="mt-10 text-sm text-[#B7A99A]" role="status">
            Carregando seus favoritos...
          </p>
        )}

        {isError && (
          <p className="mt-10 text-sm text-red-400" role="alert">
            Não foi possível carregar os NFTs.
          </p>
        )}

        {!isLoading && !isError && favorites.length === 0 && (
          <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-xl font-semibold">Sua lista está vazia</h2>
            <p className="mt-2 text-sm text-[#B7A99A]">
              Explore o marketplace e salve os NFTs que mais gostar.
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
              className="mt-6 inline-flex rounded-full bg-[#D9A441] px-6 py-3 font-semibold text-[#140D0A] transition hover:bg-[#edbd62]"
            >
              Explorar NFTs
            </Link>
          </section>
        )}

        {!isLoading && favorites.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((nft) => (
              <article
                key={nft.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="relative aspect-square bg-[#211713] p-5">
                  <Link
                    to="/nft/$nftId"
                    params={{ nftId: nft.id }}
                    aria-label={`Ver detalhes de ${nft.name}`}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <img
                      src={`/images/nfts/${nft.image}`}
                      alt={nft.name}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </Link>
                  <div className="absolute right-4 top-4">
                    <FavoriteButton nftId={nft.id} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <h2 className="font-semibold">{nft.name}</h2>
                  <span className="shrink-0 text-sm font-semibold text-[#D9A441]">
                    {typeof nft.price === 'number'
                      ? `${nft.price.toFixed(2)} ETH`
                      : 'Indisponível'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default Favorites
