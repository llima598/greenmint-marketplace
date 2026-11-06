
import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { useCart } from '../context/useCart'
import { api } from '../services/api'

interface CouponResponse {
  code: string
  discountPercentage: number
  message: string
}

function Cart() {
  const {
    items,
    coupon,
    setCoupon,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart()

  const [couponCode, setCouponCode] = useState(coupon?.code ?? '')
  const [couponMessage, setCouponMessage] = useState('')
  const [couponError, setCouponError] = useState(false)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price ?? 0) * item.quantity
  }, 0)

  const discount = coupon
    ? subtotal * (coupon.discountPercentage / 100)
    : 0

  const total = Math.max(0, subtotal - discount)

  const totalItems = items.reduce((sum, item) => {
    return sum + item.quantity
  }, 0)

  async function handleApplyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const code = couponCode.trim()

    if (!code) {
      setCouponError(true)
      setCouponMessage('Informe um código de cupom.')
      return
    }

    setIsApplyingCoupon(true)
    setCouponMessage('')
    setCouponError(false)

    try {
      const response = await api.post<CouponResponse>(
        '/coupons/validate',
        { code },
      )

      setCoupon({
        code: response.data.code,
        discountPercentage: response.data.discountPercentage,
      })

      setCouponCode(response.data.code)
      setCouponMessage(response.data.message)
    } catch (error) {
      setCouponError(true)

      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : 'Não foi possível validar o cupom. Tente novamente.'

      setCouponMessage(message)
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  function handleRemoveCoupon() {
    setCoupon(null)
    setCouponCode('')
    setCouponMessage('Cupom removido.')
    setCouponError(false)
  }

  function handleClearCart() {
    clearCart()
    setCouponCode('')
    setCouponMessage('')
    setCouponError(false)
  }

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
        className="mb-10 inline-block text-sm text-white/60 hover:text-[#D9A441]"
      >
        ← Voltar ao marketplace
      </Link>

      <h1 className="mb-8 text-3xl font-bold">
        Meu carrinho
      </h1>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#241612] p-10 text-center">
          <p className="text-white/60">
            Seu carrinho está vazio.
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
            className="mt-6 inline-block rounded-full bg-[#D9A441] px-8 py-3 font-bold text-[#140D0A]"
          >
            Explorar NFTs
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => {
              const itemSubtotal =
                (item.price ?? 0) * item.quantity

              return (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#241612] p-4 sm:flex-row sm:items-center sm:gap-5"
                >
                  <img
                    src={`/images/nfts/${item.image}`}
                    alt={item.name}
                    className="h-24 w-24 shrink-0 rounded-xl bg-[#211713] object-contain p-2"
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold">
                      {item.name}
                    </h2>

                    <p className="mt-2 text-sm text-white/50">
                      Preço unitário
                    </p>

                    <p className="font-bold text-[#D9A441]">
                      {item.price !== null
                        ? `${item.price.toFixed(2)} ETH`
                        : 'Preço indisponível'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                    <div>
                      <p className="mb-2 text-center text-xs text-white/50">
                        Quantidade
                      </p>

                      <div className="flex items-center gap-3 rounded-full border border-white/10 px-2 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1,
                            )
                          }
                          disabled={item.quantity <= 1}
                          aria-label={`Diminuir quantidade de ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          −
                        </button>

                        <span className="min-w-5 text-center font-semibold tabular-nums">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1,
                            )
                          }
                          aria-label={`Aumentar quantidade de ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-white/10"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="min-w-24 text-right">
                      <p className="mb-2 text-xs text-white/50">
                        Subtotal
                      </p>

                      <p className="font-bold text-[#D9A441]">
                        {itemSubtotal.toFixed(2)} ETH
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm text-red-400 transition hover:text-red-300"
                    >
                      Remover
                    </button>
                  </div>
                </article>
              )
            })}

            <button
              type="button"
              onClick={handleClearCart}
              className="text-sm text-white/50 transition hover:text-red-400"
            >
              Limpar carrinho
            </button>
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-[#241612] p-6">
            <h2 className="text-xl font-bold">
              Resumo do pedido
            </h2>

            <div className="mt-6 flex justify-between text-white/60">
              <span>Produtos</span>
              <span>{items.length}</span>
            </div>

            <div className="mt-4 flex justify-between text-white/60">
              <span>Quantidade total</span>
              <span>{totalItems}</span>
            </div>

            <form
              onSubmit={handleApplyCoupon}
              className="mt-6 border-t border-white/10 pt-6"
            >
              <label
                htmlFor="coupon"
                className="mb-3 block text-sm font-semibold"
              >
                Cupom de desconto
              </label>

              <div className="flex gap-2">
                <input
                  id="coupon"
                  type="text"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value)
                    setCouponMessage('')
                    setCouponError(false)
                  }}
                  placeholder="Digite seu cupom"
                  disabled={isApplyingCoupon}
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#140D0A] px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#D9A441] disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={isApplyingCoupon}
                  className="rounded-lg bg-[#D9A441] px-4 py-3 text-sm font-bold text-[#140D0A] transition hover:bg-[#edbd62] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isApplyingCoupon ? '...' : 'Aplicar'}
                </button>
              </div>

              {couponMessage && (
                <p
                  role="status"
                  className={`mt-3 text-sm ${
                    couponError
                      ? 'text-red-400'
                      : 'text-green-400'
                  }`}
                >
                  {couponMessage}
                </p>
              )}

              {coupon && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="mt-3 text-sm text-red-400 transition hover:text-red-300"
                >
                  Remover cupom
                </button>
              )}
            </form>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} ETH</span>
              </div>

              <div className="flex justify-between text-white/60">
                <span>Desconto</span>
                <span className="text-green-400">
                  {discount > 0
                    ? `-${discount.toFixed(2)} ETH`
                    : '—'}
                </span>
              </div>

              <div className="flex justify-between text-lg">
                <strong>Total</strong>

                <strong className="text-[#D9A441]">
                  {total.toFixed(2)} ETH
                </strong>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-8 block w-full rounded-full bg-[#D9A441] px-6 py-4 text-center font-bold text-[#140D0A] transition hover:bg-[#edbd62]"
            >
              Continuar compra
            </Link>
          </aside>
        </div>
      )}
    </main>
  )
}

export default Cart
