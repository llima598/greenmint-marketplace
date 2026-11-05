
export type NFTCategory =
  | 'Arte digital'
  | 'Fotografia'
  | 'Música'
  | 'Arte 3D'
  | 'Colecionáveis'
  | 'Generativa'
  | 'Jogos'
  | 'Utilidade'

export type NFTNetwork = 'Ethereum' | 'Polygon' | 'Solana'

export interface NFT {
  id: string
  name: string
  price: number | null
  image: string
  category: NFTCategory
  network: NFTNetwork
}

export const nfts: NFT[] = [
  {
    id: 'emerald-ape-042',
    name: 'Emerald Ape #042',
    price: 1.19,
    image: 'nft-01.png',
    category: 'Colecionáveis',
    network: 'Ethereum',
  },
  {
    id: 'sage-nomad-009',
    name: 'Sage Nomad #009',
    price: 1.69,
    image: 'nft-02.png',
    category: 'Arte digital',
    network: 'Polygon',
  },
  {
    id: 'neon-vessel-552',
    name: 'Neon Vessel #552',
    price: 1.99,
    image: 'nft-03.png',
    category: 'Arte 3D',
    network: 'Ethereum',
  },
  {
    id: 'cosmic-bloom-118',
    name: 'Cosmic Bloom #118',
    price: 1.29,
    image: 'nft-04.png',
    category: 'Generativa',
    network: 'Solana',
  },
  {
    id: 'violet-nomad-314',
    name: 'Violet Nomad #314',
    price: 1.39,
    image: 'nft-05.png',
    category: 'Fotografia',
    network: 'Polygon',
  },
  {
    id: 'ivory-baron-088',
    name: 'Ivory Baron #088',
    price: 1.79,
    image: 'nft-06.png',
    category: 'Arte digital',
    network: 'Ethereum',
  },
  {
    id: 'golden-beat-207',
    name: 'Golden Beat #207',
    price: 0.99,
    image: 'nft-07.png',
    category: 'Música',
    network: 'Solana',
  },
  {
    id: 'nft-08',
    name: 'NFT sem identificação',
    price: null,
    image: 'nft-08.png',
    category: 'Utilidade',
    network: 'Polygon',
  },
  {
    id: 'golden-signal-160',
    name: 'Golden Signal #160',
    price: 0.39,
    image: 'nft-09.png',
    category: 'Jogos',
    network: 'Ethereum',
  },
]
