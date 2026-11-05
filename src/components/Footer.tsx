import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'

function Footer() {
  const [newsletterMessage, setNewsletterMessage] = useState('')

  const homeSearch = {
    search: undefined,
    sort: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    category: undefined,
    network: undefined,
    page: undefined,
  }

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setNewsletterMessage(
      'O cadastro da newsletter ainda não está disponível. Em breve teremos novidades!',
    )
  }

  return (
    <footer className="mt-16 sm:mt-20 lg:mt-24">
      {/* Benefícios */}
      <section
        aria-label="Benefícios da plataforma"
        className="grid gap-8 border-b border-[#493027] py-10 sm:grid-cols-2 sm:py-12 lg:grid-cols-3"
      >
        <article>
          <div
            aria-hidden="true"
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#352019] text-2xl"
          >
            ◈
          </div>

          <h3 className="font-semibold text-white">
            Segurança da carteira
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-[#B7A99A]">
            Suas transações e ativos protegidos com tecnologia blockchain.
          </p>
        </article>

        <article>
          <div
            aria-hidden="true"
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#352019] text-2xl"
          >
            ✦
          </div>

          <h3 className="font-semibold text-white">
            Criadores em destaque
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-[#B7A99A]">
            Descubra artistas talentosos e coleções digitais exclusivas.
          </p>
        </article>

        <article>
          <div
            aria-hidden="true"
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#352019] text-2xl"
          >
            ◷
          </div>

          <h3 className="font-semibold text-white">
            Alertas de lançamentos
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-[#B7A99A]">
            Fique por dentro das novidades e não perca novas coleções.
          </p>
        </article>
      </section>

      {/* Newsletter */}
      <section className="my-10 rounded-2xl bg-[#241612] p-5 sm:my-12 sm:p-8 md:flex md:items-center md:justify-between md:gap-8 md:p-10">
        <div className="max-w-lg">
          <h2 className="text-xl font-bold text-white md:text-2xl">
            Receba novidades da GreenMint
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-[#B7A99A]">
            Inscreva-se em nossa newsletter e acompanhe lançamentos,
            tendências e oportunidades do universo NFT.
          </p>
        </div>

        <form
          onSubmit={handleNewsletterSubmit}
          className="mt-6 flex w-full flex-col gap-3 sm:flex-row md:mt-0 md:max-w-md"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Seu melhor e-mail
          </label>

          <input
            id="newsletter-email"
            name="email"
            type="email"
            placeholder="Seu melhor e-mail"
            autoComplete="email"
            required
            className="min-w-0 flex-1 rounded-lg border border-[#493027] bg-[#140D0A] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8D7B6D] focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C]"
          />

          <button
            type="submit"
            className="rounded-lg bg-[#D28A4C] px-6 py-3 text-sm font-semibold text-[#140D0A] transition hover:bg-[#E5A365] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9A441]"
          >
            Inscrever-se
          </button>
        </form>

        {newsletterMessage && (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 text-xs leading-relaxed text-[#D9A441] md:absolute"
          >
            {newsletterMessage}
          </p>
        )}
      </section>

      {/* Links do rodapé */}
      <section className="grid gap-10 border-t border-[#493027] py-10 sm:grid-cols-2 sm:py-12 lg:grid-cols-4">
        <div>
          <h3 className="text-xl font-bold tracking-wide text-[#D28A4C]">
            KURIO
          </h3>

          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#B7A99A]">
            Explore, descubra e colecione o futuro da arte digital.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Minha conta</h4>

          <ul className="mt-4 space-y-3 text-sm text-[#B7A99A]">
            <li>
              <Link
                to="/profile"
                className="transition hover:text-[#D28A4C] focus-visible:outline-2 focus-visible:outline-[#D9A441]"
              >
                Meu perfil
              </Link>
            </li>

            <li>
              <Link
                to="/orders"
                className="transition hover:text-[#D28A4C] focus-visible:outline-2 focus-visible:outline-[#D9A441]"
              >
                Meus pedidos
              </Link>
            </li>

            <li>
              <Link
                to="/cart"
                className="transition hover:text-[#D28A4C] focus-visible:outline-2 focus-visible:outline-[#D9A441]"
              >
                Meu carrinho
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Explore</h4>

          <ul className="mt-4 space-y-3 text-sm text-[#B7A99A]">
            <li>
              <Link
                to="/"
                search={homeSearch}
                hash="nft-search"
                className="transition hover:text-[#D28A4C] focus-visible:outline-2 focus-visible:outline-[#D9A441]"
              >
                Mercado
              </Link>
            </li>

            <li className="text-[#8D7B6D]">
              Coleções — em breve
            </li>

            <li className="text-[#8D7B6D]">
              Criadores — em breve
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Ajuda e suporte</h4>

          <ul className="mt-4 space-y-3 text-sm text-[#8D7B6D]">
            <li>Central de ajuda — em breve</li>
            <li>Sobre a plataforma — em breve</li>
            <li>Contato — em breve</li>
          </ul>

          <h4 className="mt-6 font-semibold text-white">
            Redes sociais
          </h4>

          <p className="mt-3 text-sm text-[#8D7B6D]">
            Em breve
          </p>
        </div>
      </section>

      {/* Direitos autorais */}
      <div className="border-t border-[#493027] py-6 text-center text-xs text-[#8D7B6D]">
        © 2026 KURIO. Todos os direitos reservados.
      </div>
    </footer>
  )
}

export default Footer