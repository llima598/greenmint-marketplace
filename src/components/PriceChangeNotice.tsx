import { useCart } from '../context/useCart'

function formatPrice(price: number | null): string {
  return price === null ? 'indisponível' : `${price.toFixed(2)} ETH`
}

// Aviso exibido quando o preço ou a disponibilidade de um item do carrinho
// muda (evento `nft.updated`, reconexão ou conflito no checkout). O resumo
// do pedido já usa os valores novos; o usuário precisa reconhecer a mudança
// antes de confirmar a compra.
function PriceChangeNotice() {
  const { priceChanges, acknowledgePriceChanges } = useCart()

  if (priceChanges.length === 0) {
    return null
  }

  return (
    <div
      role="alert"
      className="mb-8 rounded-2xl border border-[#D9A441]/50 bg-[#D9A441]/10 p-5"
    >
      <p className="font-semibold text-[#D9A441]">
        Atenção: o valor de itens do seu carrinho mudou
      </p>

      <ul className="mt-3 space-y-1 text-sm text-white/80">
        {priceChanges.map((change) => (
          <li key={change.id}>
            <strong>{change.name}</strong>:{' '}
            {formatPrice(change.previousPrice)} →{' '}
            {formatPrice(change.currentPrice)}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm text-white/60">
        O resumo foi atualizado com os valores atuais. Revise o pedido
        para continuar.
      </p>

      <button
        type="button"
        onClick={acknowledgePriceChanges}
        className="mt-4 rounded-full bg-[#D9A441] px-5 py-2 text-sm font-bold text-[#140D0A] transition hover:bg-[#edbd62]"
      >
        Entendi, revisar pedido
      </button>
    </div>
  )
}

export default PriceChangeNotice
