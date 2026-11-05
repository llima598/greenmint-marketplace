
import { Link } from '@tanstack/react-router'
import { useCart } from '../context/useCart'

function Cart() {
  const { items, removeFromCart, clearCart } = useCart()

  const total = items.reduce((sum, item) => {
    return sum + (item.price ?? 0)
  }, 0)

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
            {items.map((item) => (
              <article
                key={item.id}
                className="flex items-center gap-5 rounded-2xl border border-white/10 bg-[#241612] p-4"
              >
                <img
                  src={`/images/nfts/${item.image}`}
                  alt={item.name}
                  className="h-24 w-24 rounded-xl bg-[#211713] object-contain p-2"
                />

                <div className="flex-1">
                  <h2 className="font-semibold">
                    {item.name}
                  </h2>

                  <p className="mt-2 font-bold text-[#D9A441]">
                    {item.price?.toFixed(2)} ETH
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remover
                </button>
              </article>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-white/50 hover:text-red-400"
            >
              Limpar carrinho
            </button>
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-[#241612] p-6">
            <h2 className="text-xl font-bold">
              Resumo do pedido
            </h2>

            <div className="mt-6 flex justify-between text-white/60">
              <span>Itens</span>
              <span>{items.length}</span>
            </div>

            <div className="mt-4 flex justify-between">
              <span>Total</span>
              <strong className="text-[#D9A441]">
                {total.toFixed(2)} ETH
              </strong>
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
