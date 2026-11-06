
import { Link } from '@tanstack/react-router'

function Hero() {
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
    <section className="grid min-h-[527px] grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col items-start">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-[#D9A441] sm:text-sm">
          Explore o universo digital
        </p>

        <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          SEJA DONO DO FUTURO DA ARTE DIGITAL
        </h1>

        <p className="mt-6 max-w-md text-sm leading-7 text-white/60 sm:text-base">
          Descubra, colecione e negocie NFTs exclusivos.
          Entre em um universo onde a criatividade nao tem limites.
        </p>

        <Link
          to="/"
          search={homeSearch}
          hash="nft-search"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#D9A441] px-8 py-4 text-sm font-bold text-[#140D0A] transition hover:bg-[#edbd62] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9A441]"
        >
          Explorar
        </Link>
      </div>

      <div className="flex min-h-[280px] items-center justify-center sm:min-h-[350px] lg:min-h-[400px]">
        <img
          src="/images/hero-nft.png"
          alt="NFT de macaco com oculos e jaqueta verde"
          width={550}
          height={450}
          className="h-auto max-h-[450px] w-full max-w-[550px] object-contain"
          fetchPriority="high"
        />
      </div>
    </section>
  )
}

export default Hero
