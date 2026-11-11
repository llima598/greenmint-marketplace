import { api } from './api'
import type { NFT } from '../data/nfts'

// Consulta completa usada pelo carrinho e pela tela de favoritos.
// A listagem principal usa a versão filtrada e paginada do endpoint.
// Eventos `nft.updated` invalidam as duas consultas pelo prefixo ['nfts'].
export async function fetchNfts(): Promise<NFT[]> {
  const response = await api.get<unknown>('/nfts')

  if (!Array.isArray(response.data)) {
    throw new Error('A API retornou uma lista de NFTs inválida.')
  }

  return response.data as NFT[]
}
