import { api } from './api'
import type { NFT } from '../data/nfts'

// Consulta do catálogo usada com a chave ['nfts'].
// O catálogo (Products) e o carrinho (CartProvider) compartilham a mesma
// chave de cache, então o evento `nft.updated` recebido pelo Socket.IO
// atualiza os dois ao mesmo tempo.
export async function fetchNfts(): Promise<NFT[]> {
  const response = await api.get<unknown>('/nfts')

  if (!Array.isArray(response.data)) {
    throw new Error('A API retornou uma lista de NFTs inválida.')
  }

  return response.data as NFT[]
}
