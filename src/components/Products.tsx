
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { api } from '../services/api'
import type { NFT, NFTCategory, NFTNetwork } from '../data/nfts'

const categories: NFTCategory[] = [
  'Arte digital',
  'Fotografia',
  'Música',
  'Arte 3D',
  'Colecionáveis',
  'Generativa',
  'Jogos',
  'Utilidade',
]

const networks: NFTNetwork[] = [
  'Ethereum',
  'Polygon',
  'Solana',
]

const ITEMS_PER_PAGE = 6

function FeaturedNft() {
  return (
    <article className="flex min-h-[390px] w-full flex-col overflow-hidden rounded-2xl border border-[#D28A4C]/20 bg-gradient-to-b from-[rgba(210,138,76,0.10)] to-[rgba(210,138,76,0.03)] lg:h-[470px]">
      <img
        src="/images/featured-nft-banner.png"
        alt="NFT em destaque - oferta limitada"
        className="h-auto w-full object-contain"
      />

      <div className="px-4 pb-5 pt-3">
        <h3 className="font-semibold">Golden Beat #207</h3>

        <p className="mt-2 text-lg font-bold text-[#D9A441]">
          0.99 ETH
        </p>
      </div>
    </article>
  )
}

function Products() {
  const navigate = useNavigate({ from: '/' })

  const {
    search = '',
    sort = 'recent',
    minPrice,
    maxPrice,
    category,
    network,
    page = 1,
  } = useSearch({ from: '/' })

  const [filtersOpen, setFiltersOpen] = useState(false)

  const selectedCategories = category ? category.split(',') : []
  const selectedNetworks = network ? network.split(',') : []

  const {
    data: nfts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['nfts'],
    queryFn: async () => {
      const response = await api.get<NFT[]>('/nfts')
      return response.data
    },
  })

  const filteredNfts = nfts?.filter((nft) => {
    const matchesSearch = nft.name
      .toLowerCase()
      .includes(search.trim().toLowerCase())

    const matchesMinPrice =
      minPrice === undefined ||
      (nft.price !== null && nft.price >= minPrice)

    const matchesMaxPrice =
      maxPrice === undefined ||
      (nft.price !== null && nft.price <= maxPrice)

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(nft.category)

    const matchesNetwork =
      selectedNetworks.length === 0 ||
      selectedNetworks.includes(nft.network)

    return (
      matchesSearch &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesCategory &&
      matchesNetwork
    )
  })

  const sortedNfts = [...(filteredNfts ?? [])].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return (a.price ?? Infinity) - (b.price ?? Infinity)

      case 'price-desc':
        return (b.price ?? -Infinity) - (a.price ?? -Infinity)

      case 'name':
        return a.name.localeCompare(b.name)

      default:
        return 0
    }
  })

  const totalPages = Math.max(
    1,
    Math.ceil(sortedNfts.length / ITEMS_PER_PAGE),
  )

  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE

  const paginatedNfts = sortedNfts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  )

  function handleSearch(value: string) {
    navigate({
      search: (previous) => ({
        ...previous,
        search: value || undefined,
        page: undefined,
      }),
      replace: true,
    })
  }

  function handleSort(value: string) {
    navigate({
      search: (previous) => ({
        ...previous,
        sort: value === 'recent' ? undefined : value,
        page: undefined,
      }),
      replace: true,
    })
  }

  function handlePriceFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const minValue = String(formData.get('minPrice') ?? '').trim()
    const maxValue = String(formData.get('maxPrice') ?? '').trim()

    const min = minValue ? Number(minValue) : undefined
    const max = maxValue ? Number(maxValue) : undefined

    if (
      (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
      (max !== undefined && (!Number.isFinite(max) || max < 0))
    ) {
      window.alert('Informe preços válidos e não negativos.')
      return
    }

    if (min !== undefined && max !== undefined && min > max) {
      window.alert('O preço mínimo não pode ser maior que o máximo.')
      return
    }

    navigate({
      search: (previous) => ({
        ...previous,
        minPrice: min,
        maxPrice: max,
        page: undefined,
      }),
      replace: true,
    })
  }

  function handleClearPriceFilter() {
    navigate({
      search: (previous) => ({
        ...previous,
        minPrice: undefined,
        maxPrice: undefined,
        page: undefined,
      }),
      replace: true,
    })
  }

  function handleCategoryChange(value: NFTCategory) {
    const updated = selectedCategories.includes(value)
      ? selectedCategories.filter((item) => item !== value)
      : [...selectedCategories, value]

    navigate({
      search: (previous) => ({
        ...previous,
        category: updated.length > 0 ? updated.join(',') : undefined,
        page: undefined,
      }),
      replace: true,
    })
  }

  function handleNetworkChange(value: NFTNetwork) {
    const updated = selectedNetworks.includes(value)
      ? selectedNetworks.filter((item) => item !== value)
      : [...selectedNetworks, value]

    navigate({
      search: (previous) => ({
        ...previous,
        network: updated.length > 0 ? updated.join(',') : undefined,
        page: undefined,
      }),
      replace: true,
    })
  }

  function handleClearCategoryAndNetwork() {
    navigate({
      search: (previous) => ({
        ...previous,
        category: undefined,
        network: undefined,
        page: undefined,
      }),
      replace: true,
    })
  }

  function handlePageChange(newPage: number) {
    navigate({
      search: (previous) => ({
        ...previous,
        page: newPage === 1 ? undefined : newPage,
      }),
      replace: true,
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (isLoading) {
    return (
      <section className="py-12 text-center text-white/60 sm:py-20">
        Carregando NFTs...
      </section>
    )
  }

  if (isError) {
    return (
      <section className="py-12 text-center text-red-400 sm:py-20">
        Não foi possível carregar os NFTs.
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-20">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-5 sm:mb-10">
        <div>
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[#D9A441]">
            Marketplace
          </p>

          <h2 className="text-2xl font-bold sm:text-3xl">
            Explore NFTs
          </h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-10">
        {/* Filtros e destaque */}
        <aside className="flex min-w-0 flex-col gap-8">
          {/* Botão de filtros mobile */}
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="marketplace-filters"
            onClick={() => setFiltersOpen((previous) => !previous)}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#241612] px-5 py-4 text-left font-semibold transition hover:border-[#D9A441]/60 lg:hidden"
          >
            <span>
              Filtros
              {(selectedCategories.length > 0 ||
                selectedNetworks.length > 0 ||
                minPrice !== undefined ||
                maxPrice !== undefined) && (
                <span className="ml-2 text-sm font-normal text-[#D9A441]">
                  (ativos)
                </span>
              )}
            </span>

            <span
              aria-hidden="true"
              className="text-[#D9A441]"
            >
              {filtersOpen ? '−' : '+'}
            </span>
          </button>

          <div
            id="marketplace-filters"
            className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}
          >
            <div className="w-full rounded-2xl border border-white/10 bg-[#241612] p-5 lg:min-h-[785px]">
              <fieldset>
                <legend className="mb-4 font-semibold">
                  Coleções
                </legend>

                {categories.map((name) => (
                  <label
                    key={name}
                    className="mb-3 flex cursor-pointer items-center justify-between gap-3 text-sm text-white/60 transition hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(name)}
                        onChange={() => handleCategoryChange(name)}
                        className="h-4 w-4 shrink-0 accent-[#D9A441] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9A441]"
                      />

                      {name}
                    </span>

                    <span>
                      ({nfts?.filter((nft) => nft.category === name).length ?? 0})
                    </span>
                  </label>
                ))}
              </fieldset>

              <fieldset className="mt-8">
                <legend className="mb-4 font-semibold">
                  Faixa de preço
                </legend>

                <form
                  key={`${minPrice ?? ''}-${maxPrice ?? ''}`}
                  onSubmit={handlePriceFilter}
                  className="flex flex-col gap-3"
                >
                  <label
                    htmlFor="min-price"
                    className="text-sm text-white/60"
                  >
                    Mínimo (ETH)

                    <input
                      id="min-price"
                      name="minPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={minPrice ?? ''}
                      placeholder="Ex: 0.50"
                      className="mt-2 w-full rounded-lg border border-white/10 bg-[#140D0A] px-3 py-3 text-base text-white outline-none transition focus:border-[#D9A441] focus-visible:ring-2 focus-visible:ring-[#D9A441]/40"
                    />
                  </label>

                  <label
                    htmlFor="max-price"
                    className="text-sm text-white/60"
                  >
                    Máximo (ETH)

                    <input
                      id="max-price"
                      name="maxPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={maxPrice ?? ''}
                      placeholder="Ex: 2.00"
                      className="mt-2 w-full rounded-lg border border-white/10 bg-[#140D0A] px-3 py-3 text-base text-white outline-none transition focus:border-[#D9A441] focus-visible:ring-2 focus-visible:ring-[#D9A441]/40"
                    />
                  </label>

                  <button
                    type="submit"
                    className="mt-2 rounded-full border border-[#D9A441] px-5 py-3 text-sm text-[#D9A441] transition hover:bg-[#D9A441] hover:text-[#140D0A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9A441]"
                  >
                    Aplicar
                  </button>

                  <button
                    type="button"
                    onClick={handleClearPriceFilter}
                    className="py-2 text-sm text-white/50 transition hover:text-white focus-visible:outline-2 focus-visible:outline-[#D9A441]"
                  >
                    Limpar filtros de preço
                  </button>
                </form>
              </fieldset>

              <fieldset className="mt-8">
                <legend className="mb-4 font-semibold">
                  Rede
                </legend>

                {networks.map((name) => (
                  <label
                    key={name}
                    className="mb-3 flex cursor-pointer items-center justify-between gap-3 text-sm text-white/60 transition hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedNetworks.includes(name)}
                        onChange={() => handleNetworkChange(name)}
                        className="h-4 w-4 shrink-0 accent-[#D9A441] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9A441]"
                      />

                      {name}
                    </span>

                    <span>
                      ({nfts?.filter((nft) => nft.network === name).length ?? 0})
                    </span>
                  </label>
                ))}
              </fieldset>

              <button
                type="button"
                onClick={handleClearCategoryAndNetwork}
                className="mt-6 py-2 text-left text-sm text-white/50 transition hover:text-white focus-visible:outline-2 focus-visible:outline-[#D9A441]"
              >
                Limpar coleções e redes
              </button>
            </div>
          </div>

          {/* NFT em destaque: desktop */}
          <div className="hidden lg:block">
            <FeaturedNft />
          </div>
        </aside>

        {/* Catálogo */}
        <div className="min-w-0">
          <div className="mb-6">
            <label
              htmlFor="nft-search"
              className="sr-only"
            >
              Buscar NFT pelo nome
            </label>

            <input
              id="nft-search"
              type="search"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Buscar NFT pelo nome..."
              className="w-full rounded-xl border border-white/10 bg-[#241612] px-5 py-4 text-base text-white outline-none transition placeholder:text-white/40 focus:border-[#D9A441] focus-visible:ring-2 focus-visible:ring-[#D9A441]/30"
            />
          </div>

          <div className="mb-6 flex flex-col gap-4 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {sortedNfts.length} NFTs encontrados
            </span>

            <label className="flex flex-wrap items-center gap-2">
              Ordenar por:

              <select
                value={sort}
                onChange={(event) => handleSort(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#241612] px-3 py-3 text-white outline-none transition focus:border-[#D9A441] focus-visible:ring-2 focus-visible:ring-[#D9A441]/30 sm:flex-none"
              >
                <option value="recent">Listados recentemente</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="name">Nome (A–Z)</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 xl:gap-8">
            {paginatedNfts.map((nft) => (
              <Link
                key={nft.id}
                to="/nft/$nftId"
                params={{ nftId: nft.id }}
                aria-label={`Ver detalhes de ${nft.name}`}
                className="block min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-[#D9A441]/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9A441]"
              >
                <article>
                  <div className="flex aspect-square items-center justify-center bg-[#211713] p-4 sm:p-6 lg:p-8">
                    <img
                      src={`/images/nfts/${nft.image}`}
                      alt={nft.name}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {sortedNfts.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold text-white/80">
                Nenhum NFT encontrado.
              </p>

              <p className="mt-2 text-sm text-white/50">
                Tente pesquisar por outro nome ou ajustar os filtros.
              </p>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <nav
              aria-label="Paginação dos NFTs"
              className="mt-10 flex flex-wrap items-center justify-end gap-2"
            >
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                className="flex h-10 min-w-10 items-center justify-center rounded-md border border-white/20 px-3 text-sm text-white transition hover:border-[#D9A441] disabled:cursor-not-allowed disabled:opacity-30"
              >
                ←
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1,
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  aria-label={`Página ${pageNumber}`}
                  aria-current={
                    currentPage === pageNumber ? 'page' : undefined
                  }
                  className={`flex h-10 w-10 items-center justify-center rounded-md text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9A441] ${
                    currentPage === pageNumber
                      ? 'bg-[#D9A441] font-bold text-[#140D0A]'
                      : 'border border-white/20 text-white hover:border-[#D9A441]'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
                className="flex h-10 min-w-10 items-center justify-center rounded-md border border-white/20 px-3 text-sm text-white transition hover:border-[#D9A441] disabled:cursor-not-allowed disabled:opacity-30"
              >
                →
              </button>
            </nav>
          )}

          <p className="mt-4 text-right text-xs text-white/40">
            Página {currentPage} de {totalPages}
          </p>

          {/* NFT em destaque: mobile */}
          <div className="mt-10 lg:hidden">
            <FeaturedNft />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Products
