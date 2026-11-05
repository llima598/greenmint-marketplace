import { Link } from '@tanstack/react-router'

function Promos() {
  const homeSearch = {
    search: undefined,
    sort: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    category: undefined,
    network: undefined,
    page: undefined,
  }

  return (
    <section className="mt-12 grid min-h-[250px] grid-cols-1 gap-5 sm:mt-16 md:grid-cols-2 md:gap-8">
      <article className="flex min-w-0 items-center gap-4 overflow-hidden rounded-2xl bg-[#241612] p-4 sm:gap-5 sm:p-5">
        <img
          src="/images/hero-nft.png"
          alt="NFT de macaco com óculos"
          loading="lazy"
          className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28"
        />

        <div className="flex min-w-0 flex-col items-start">
          <h3 className="text-sm font-bold leading-snug text-white sm:text-base">
            Lançamentos gênesis de edição limitada
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-[#B7A99A] sm:text-sm">
            Colecione edições especiais e descubra novas oportunidades no
            universo digital.
          </p>

          <Link
            to="/"
            search={homeSearch}
            hash="nft-search"
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#D28A4C] px-4 py-2 text-xs font-semibold text-[#140D0A] transition hover:bg-[#E5A365] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9A441]"
          >
            Explorar <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      <article className="flex min-w-0 items-center gap-4 overflow-hidden rounded-2xl bg-[#241612] p-4 sm:gap-5 sm:p-5">
        <img
          src="/images/promo-nft.png"
          alt="NFT de macaco em arte digital"
          loading="lazy"
          className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28"
        />

        <div className="flex min-w-0 flex-col items-start">
          <h3 className="text-sm font-bold leading-snug text-white sm:text-base">
            Arte digital selecionada e muito mais
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-[#B7A99A] sm:text-sm">
            Explore novas obras, encontre artistas exclusivos e descubra
            coleções incríveis.
          </p>

          <Link
            to="/"
            search={homeSearch}
            hash="nft-search"
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#D28A4C] px-4 py-2 text-xs font-semibold text-[#140D0A] transition hover:bg-[#E5A365] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9A441]"
          >
            Explorar <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
    </section>
  )
}

export default Promos