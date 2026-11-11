
import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { useCart } from '../context/useCart'
import { useAuth } from '../context/useAuth'

function Header() {
  const { items } = useCart()
  const { user, isLoading, logout } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleLogout() {
    logout()
    closeMenu()
  }

  function handleSearchFocus() {
    closeMenu()

    const searchInput = document.getElementById('nft-search')

    if (searchInput instanceof HTMLInputElement) {
      searchInput.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      searchInput.focus()
      return
    }

    window.location.assign('/#nft-search')
  }

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
    <header className="relative z-30 border-b border-white/10">
      <div className="flex h-20 min-w-0 items-center justify-between gap-3">
        {/* Logo */}
        <Link
          to="/"
          search={homeSearch}
          onClick={closeMenu}
          aria-label="KURIO - Página inicial"
          className="shrink-0 text-2xl font-black tracking-tight"
        >
          KURIO<span className="text-[#D9A441]">.</span>
        </Link>

        {/* Navegação desktop */}
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-6 text-sm text-white/70 lg:flex xl:gap-8"
        >
          <Link
            to="/"
            search={homeSearch}
            className="text-white transition hover:text-[#D9A441]"
          >
            Início
          </Link>

          <a
            href="/#nft-search"
            className="transition hover:text-[#D9A441]"
          >
            Mercado
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {/* Pesquisa */}
          <button
            type="button"
            onClick={handleSearchFocus}
            aria-label="Buscar NFTs"
            title="Buscar NFTs"
            className="hidden text-xl text-white/80 transition hover:text-[#D9A441] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9A441] sm:block"
          >
            ⌕
          </button>

          {/* Carrinho */}
          <Link
            to="/cart"
            onClick={closeMenu}
            aria-label={`Carrinho${items.length > 0 ? `, ${items.length} itens` : ''}`}
            className="relative flex items-center text-white/80 transition hover:text-[#D9A441] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9A441]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6" />
              <circle cx="10" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
            </svg>

            {items.length > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D9A441] px-1 text-xs font-bold text-[#140D0A]">
                {items.length}
              </span>
            )}
          </Link>

          {/* Ações da conta desktop */}
          {!isLoading && (
            <div className="hidden items-center gap-2 lg:flex xl:gap-3">
              {user ? (
                <>
                  <span className="hidden max-w-24 truncate text-sm text-white/80 xl:block">
                    Olá, {user.name.split(' ')[0]}
                  </span>

                  <Link
                    to="/profile"
                    className="whitespace-nowrap rounded-full border border-white/30 px-3 py-2 text-sm transition hover:border-[#D9A441] hover:text-[#D9A441] xl:px-4"
                  >
                    Meu Perfil
                  </Link>

                  <Link
                    to="/favorites"
                    className="whitespace-nowrap rounded-full border border-white/30 px-3 py-2 text-sm transition hover:border-[#D9A441] hover:text-[#D9A441] xl:px-4"
                  >
                    Favoritos
                  </Link>

                  <Link
                    to="/orders"
                    className="whitespace-nowrap rounded-full border border-[#D9A441]/40 bg-[#D9A441]/10 px-3 py-2 text-sm font-medium text-[#D9A441] transition hover:border-[#D9A441] hover:bg-[#D9A441]/20 xl:px-4"
                  >
                    Meus Pedidos
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="whitespace-nowrap rounded-full border border-white/30 px-4 py-2 text-sm transition hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9A441]"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="whitespace-nowrap rounded-full border border-white/30 px-5 py-2 text-sm transition hover:bg-white hover:text-black xl:px-6"
                >
                  Entrar
                </Link>
              )}
            </div>
          )}

          {/* Botão do menu mobile e tablet */}
          <button
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((previous) => !previous)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-xl text-white transition hover:border-[#D9A441] hover:text-[#D9A441] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9A441] lg:hidden"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Menu mobile e tablet */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navegação mobile"
          className="absolute left-0 right-0 top-full border-b border-white/10 bg-[#1B100C] p-5 shadow-xl lg:hidden"
        >
          <div className="flex flex-col gap-5">
            <Link
              to="/"
              search={homeSearch}
              onClick={closeMenu}
              className="text-sm text-white transition hover:text-[#D9A441]"
            >
              Início
            </Link>

            <a
              href="/#nft-search"
              onClick={closeMenu}
              className="text-sm text-white/70 transition hover:text-[#D9A441]"
            >
              Mercado
            </a>

            <button
              type="button"
              onClick={handleSearchFocus}
              className="text-left text-sm text-white/70 transition hover:text-[#D9A441]"
            >
              Buscar NFTs
            </button>

            <div className="border-t border-white/10 pt-5">
              {isLoading ? (
                <p className="text-sm text-white/50">
                  Carregando conta...
                </p>
              ) : user ? (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-white/60">
                    Olá, {user.name.split(' ')[0]}
                  </p>

                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="text-sm text-white transition hover:text-[#D9A441]"
                  >
                    Meu Perfil
                  </Link>

                  <Link
                    to="/favorites"
                    onClick={closeMenu}
                    className="text-sm text-white transition hover:text-[#D9A441]"
                  >
                    Favoritos
                  </Link>

                  <Link
                    to="/orders"
                    onClick={closeMenu}
                    className="text-sm text-white transition hover:text-[#D9A441]"
                  >
                    Meus Pedidos
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-full border border-white/30 px-5 py-3 text-sm transition hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9A441]"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block rounded-full border border-white/30 px-5 py-3 text-center text-sm transition hover:bg-white hover:text-black"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header
