
import { http, HttpResponse } from 'msw'
import { nfts, type NFT } from '../data/nfts'
import { emitRealtime } from './socket'

interface MockUser {
  id: string
  name: string
  email: string
  // Hash SHA-256 da senha. Nunca armazenamos a senha em texto puro.
  passwordHash?: string
  // Campo legado: usuários salvos antes da correção ainda podem tê-lo.
  // É migrado para passwordHash no primeiro login bem-sucedido.
  password?: string
}

interface MockSession {
  token: string
  userId: string
}

interface MockOrder {
  id: string
  userId: string
  status: 'pending' | 'confirmed' | 'rejected'
  items: {
    id: string
    name: string
    price: number | null
    quantity?: number
  }[]
  total: number
  createdAt: string
  version: number
  paymentId?: string
  paidAt?: string
  idempotencyKey?: string
  // Resumo do conteúdo enviado na criação, usado para detectar reuso
  // da mesma chave de idempotência com conteúdo diferente.
  requestFingerprint?: string
}

type NFTUpdates = Partial<
  Pick<NFT, 'name' | 'price' | 'category' | 'network'>
>

const NFT_STORAGE_KEY = 'greenmint-nfts'
const NFT_VERSIONS_STORAGE_KEY = 'greenmint-nft-versions'
const PAYMENT_SIMULATION_STORAGE_KEY = 'greenmint-payment-simulation'

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? (JSON.parse(saved) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

const initialNfts = nfts.map((nft) => ({ ...nft }))
const savedNfts = readStorage<NFT[]>(NFT_STORAGE_KEY, [])

let mockNfts: NFT[] = initialNfts.map((nft) => {
  const savedNft = savedNfts.find((saved) => saved.id === nft.id)
  return savedNft ? { ...nft, ...savedNft } : nft
})

const savedNFTVersions = readStorage<Record<string, number>>(
  NFT_VERSIONS_STORAGE_KEY,
  {},
)

const nftVersions = new Map<string, number>(
  mockNfts.map((nft) => [
    nft.id,
    savedNFTVersions[nft.id] ?? 1,
  ]),
)

// SHA-256("greenmint:123456"), senha fictícia do usuário demo.
const DEMO_PASSWORD_HASH =
  '5249cb2029591536338da22a436fc817f3bbeecc5a6d24e0a63f56b58d984128'

const initialUsers: MockUser[] = [
  {
    id: 'user-demo',
    name: 'Usuário Demo',
    email: 'demo@greenmint.com',
    passwordHash: DEMO_PASSWORD_HASH,
  },
]

// Hash de demonstração (SHA-256 com prefixo fixo). Em produção, o
// hash seria feito no servidor com um algoritmo lento e salt por usuário
// (bcrypt, scrypt ou argon2).
async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`greenmint:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

// Requisição idêntica = mesmo conteúdo de itens e total.
function createOrderFingerprint(
  items: { id: string; price: number | null; quantity?: number }[],
  total: number,
): string {
  return JSON.stringify({
    items: items
      .map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity ?? 1,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    total,
  })
}

export const handlers = [
      // Validar cupom de desconto
  http.post('/api/coupons/validate', async ({ request }) => {
    const body = (await request.json()) as {
      code?: string
    }

    const code = body.code?.trim().toUpperCase()

    if (!code) {
      return HttpResponse.json(
        { message: 'Informe um código de cupom.' },
        { status: 400 },
      )
    }

    if (code !== 'GREENMINT10') {
      return HttpResponse.json(
        { message: 'Cupom inválido ou expirado.' },
        { status: 400 },
      )
    }

    return HttpResponse.json({
      code: 'GREENMINT10',
      discountPercentage: 10,
      message: 'Cupom aplicado com sucesso!',
    })
  }),
  // Buscar todos os NFTs
  http.get('/api/nfts', () => {
    return HttpResponse.json(mockNfts)
  }),

  // Atualizar NFT e emitir evento em tempo real
  http.patch('/api/nfts/:id', async ({ params, request }) => {
    const nftId = String(params.id)
    const nftIndex = mockNfts.findIndex((item) => item.id === nftId)

    if (nftIndex === -1) {
      return HttpResponse.json(
        { message: 'NFT não encontrado.' },
        { status: 404 },
      )
    }

    const body = (await request.json()) as NFTUpdates
    const allowedFields = ['name', 'price', 'category', 'network'] as const

    if (!allowedFields.some((field) => field in body)) {
      return HttpResponse.json(
        { message: 'Nenhum campo válido foi informado.' },
        { status: 400 },
      )
    }

    if (
      'name' in body &&
      (typeof body.name !== 'string' || !body.name.trim())
    ) {
      return HttpResponse.json(
        { message: 'Nome do NFT inválido.' },
        { status: 400 },
      )
    }

    if (
      'price' in body &&
      body.price !== null &&
      (typeof body.price !== 'number' ||
        !Number.isFinite(body.price) ||
        body.price < 0)
    ) {
      return HttpResponse.json(
        { message: 'Preço do NFT inválido.' },
        { status: 400 },
      )
    }

    const validCategories = [
      'Arte digital',
      'Fotografia',
      'Música',
      'Arte 3D',
      'Colecionáveis',
      'Generativa',
      'Jogos',
      'Utilidade',
    ]

    if (
      'category' in body &&
      !validCategories.includes(body.category as string)
    ) {
      return HttpResponse.json(
        { message: 'Categoria inválida.' },
        { status: 400 },
      )
    }

    const validNetworks = ['Ethereum', 'Polygon', 'Solana']

    if (
      'network' in body &&
      !validNetworks.includes(body.network as string)
    ) {
      return HttpResponse.json(
        { message: 'Rede inválida.' },
        { status: 400 },
      )
    }

    const updates: NFTUpdates = {}

    if ('name' in body) updates.name = body.name
    if ('price' in body) updates.price = body.price
    if ('category' in body) updates.category = body.category
    if ('network' in body) updates.network = body.network

    const updatedNft: NFT = {
      ...mockNfts[nftIndex],
      ...updates,
    }

    mockNfts[nftIndex] = updatedNft
    writeStorage(NFT_STORAGE_KEY, mockNfts)

    const nextVersion = (nftVersions.get(nftId) ?? 1) + 1
    nftVersions.set(nftId, nextVersion)

    writeStorage(
      NFT_VERSIONS_STORAGE_KEY,
      Object.fromEntries(nftVersions),
    )

    emitRealtime('nft.updated', {
      eventId: crypto.randomUUID(),
      resource: 'nft',
      resourceId: updatedNft.id,
      version: nextVersion,
      data: updatedNft,
    })

    console.log(
      '[MSW] NFT atualizado e evento emitido:',
      updatedNft.id,
      'versão:',
      nextVersion,
    )

    return HttpResponse.json(updatedNft)
  }),

  // Buscar NFT por ID
  http.get('/api/nfts/:id', ({ params }) => {
    const nft = mockNfts.find((item) => item.id === params.id)

    if (!nft) {
      return HttpResponse.json(
        { message: 'NFT não encontrado.' },
        { status: 404 },
      )
    }

    return HttpResponse.json(nft)
  }),

  // Buscar pedidos do usuário autenticado
  http.get('/api/orders', ({ request }) => {
    const authorization = request.headers.get('Authorization')
    const token = authorization?.replace('Bearer ', '')

    const sessions = readStorage<MockSession[]>(
      'greenmint-sessions',
      [],
    )

    const session = sessions.find((item) => item.token === token)

    if (!session) {
      return HttpResponse.json(
        { message: 'Usuário não autenticado.' },
        { status: 401 },
      )
    }

    const orders = readStorage<MockOrder[]>('greenmint-orders', [])

    const userOrders = orders
      .filter((item) => item.userId === session.userId)
      .map((order) => ({
        ...order,
        version: order.version ?? 1,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )

    return HttpResponse.json(userOrders)
  }),

  // Criar ou recuperar pedido usando chave de idempotência
  http.post('/api/orders', async ({ request }) => {
    const authorization = request.headers.get('Authorization')
    const token = authorization?.replace('Bearer ', '')

    const sessions = readStorage<MockSession[]>(
      'greenmint-sessions',
      [],
    )

    const session = sessions.find((item) => item.token === token)

    if (!session) {
      return HttpResponse.json(
        { message: 'Usuário não autenticado.' },
        { status: 401 },
      )
    }

    const users = readStorage<MockUser[]>(
      'greenmint-users',
      initialUsers,
    )

    const user = users.find((item) => item.id === session.userId)

    if (!user) {
      return HttpResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 },
      )
    }

    const body = (await request.json()) as {
      items: {
        id: string
        name: string
        price: number | null
        quantity?: number
      }[]
      total: number
    }

    if (
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      typeof body.total !== 'number' ||
      !Number.isFinite(body.total) ||
      body.total <= 0
    ) {
      return HttpResponse.json(
        { message: 'Dados do pedido inválidos.' },
        { status: 400 },
      )
    }

    const idempotencyKey = request.headers.get('Idempotency-Key')
    const orders = readStorage<MockOrder[]>('greenmint-orders', [])
    const requestFingerprint = createOrderFingerprint(
      body.items,
      body.total,
    )

    if (idempotencyKey) {
      const existingOrder = orders.find(
        (item) =>
          item.userId === user.id &&
          item.idempotencyKey === idempotencyKey,
      )

      if (
        existingOrder?.requestFingerprint &&
        existingOrder.requestFingerprint !== requestFingerprint
      ) {
        return HttpResponse.json(
          {
            code: 'IDEMPOTENCY_CONFLICT',
            message:
              'Esta chave de idempotência já foi usada com outro conteúdo.',
          },
          { status: 409 },
        )
      }

      if (existingOrder) {
        return HttpResponse.json(
          {
            id: existingOrder.id,
            status: existingOrder.status,
            message: 'Pedido recuperado com sucesso!',
            order: {
              items: existingOrder.items,
              total: existingOrder.total,
              userId: existingOrder.userId,
            },
            createdAt: existingOrder.createdAt,
          },
          { status: 200 },
        )
      }
    }

    // Revalida os preços contra o catálogo atual antes de criar o pedido.
    // Se algum preço mudou (ou o NFT ficou indisponível), o cliente precisa
    // revisar o carrinho e confirmar novamente.
    const staleItems = body.items.filter((item) => {
      const current = mockNfts.find((nft) => nft.id === item.id)

      return (
        !current ||
        current.price === null ||
        current.price !== item.price
      )
    })

    if (staleItems.length > 0) {
      return HttpResponse.json(
        {
          code: 'PRICE_CHANGED',
          message:
            'O preço ou a disponibilidade de um item mudou. Revise o carrinho e confirme novamente.',
          itemIds: staleItems.map((item) => item.id),
        },
        { status: 409 },
      )
    }

    const newOrder: MockOrder = {
      id: crypto.randomUUID(),
      userId: user.id,
      status: 'pending',
      items: body.items.map((item) => ({ ...item })),
      total: body.total,
      createdAt: new Date().toISOString(),
      version: 1,
      requestFingerprint,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    }

    orders.push(newOrder)
    writeStorage('greenmint-orders', orders)

    emitRealtime('order.updated', {
      eventId: crypto.randomUUID(),
      resource: 'order',
      resourceId: newOrder.id,
      version: newOrder.version,
      userId: newOrder.userId,
      data: newOrder,
    })

    return HttpResponse.json(
      {
        id: newOrder.id,
        status: newOrder.status,
        message: 'Pedido criado com sucesso!',
        order: {
          items: newOrder.items,
          total: newOrder.total,
          userId: newOrder.userId,
        },
        createdAt: newOrder.createdAt,
      },
      { status: 201 },
    )
  }),

  // Processar ou recuperar pagamento
  http.post('/api/payments', async ({ request }) => {
    const authorization = request.headers.get('Authorization')
    const token = authorization?.replace('Bearer ', '')

    const sessions = readStorage<MockSession[]>(
      'greenmint-sessions',
      [],
    )

    const session = sessions.find((item) => item.token === token)

    if (!session) {
      return HttpResponse.json(
        { message: 'Usuário não autenticado.' },
        { status: 401 },
      )
    }

    const body = (await request.json()) as {
      orderId?: string
      total?: number
      paymentMethod?: string
    }

    if (
      !body.orderId ||
      !body.paymentMethod ||
      body.total == null ||
      !Number.isFinite(body.total) ||
      body.total <= 0
    ) {
      return HttpResponse.json(
        { message: 'Dados de pagamento inválidos.' },
        { status: 400 },
      )
    }

    const orders = readStorage<MockOrder[]>('greenmint-orders', [])

    const orderIndex = orders.findIndex(
      (item) =>
        item.id === body.orderId &&
        item.userId === session.userId,
    )

    if (orderIndex === -1) {
      return HttpResponse.json(
        { message: 'Pedido não encontrado.' },
        { status: 404 },
      )
    }

    const order = orders[orderIndex]

    if (order.total !== body.total) {
      return HttpResponse.json(
        { message: 'O valor do pagamento não corresponde ao pedido.' },
        { status: 400 },
      )
    }

    // Recuperar uma aprovação anterior sem gerar outro pagamento.
    if (
      order.status === 'confirmed' &&
      order.paymentId &&
      order.paidAt
    ) {
      return HttpResponse.json(
        {
          paymentId: order.paymentId,
          orderId: order.id,
          status: 'approved',
          message: 'Pagamento já aprovado anteriormente.',
          simulated: true,
          paidAt: order.paidAt,
        },
        { status: 200 },
      )
    }

    if (order.status !== 'pending') {
      return HttpResponse.json(
        { message: 'Este pedido não está aguardando pagamento.' },
        { status: 409 },
      )
    }

    // Cenários controlados pelo Local Storage.
    const simulation = localStorage.getItem(
      PAYMENT_SIMULATION_STORAGE_KEY,
    )

    if (simulation === 'rejected') {
      console.warn('[MSW] Pagamento recusado no modo de simulação.')

      // Pedido recusado é terminal: o próximo envio precisa de uma nova
      // chave de idempotência (o cliente descarta a chave ao receber 402).
      const rejectedOrder: MockOrder = {
        ...order,
        status: 'rejected',
        version: (order.version ?? 1) + 1,
      }

      orders[orderIndex] = rejectedOrder
      writeStorage('greenmint-orders', orders)

      emitRealtime('order.updated', {
        eventId: crypto.randomUUID(),
        resource: 'order',
        resourceId: rejectedOrder.id,
        version: rejectedOrder.version,
        userId: rejectedOrder.userId,
        data: rejectedOrder,
      })

      return HttpResponse.json(
        {
          orderId: order.id,
          status: 'rejected',
          message: 'Pagamento recusado. Tente novamente.',
          simulated: true,
        },
        { status: 402 },
      )
    }

    if (simulation === 'pending') {
      console.info('[MSW] Pagamento permanece pendente.')

      return HttpResponse.json(
        {
          orderId: order.id,
          status: 'pending',
          message: 'Pagamento em processamento.',
          simulated: true,
        },
        { status: 202 },
      )
    }

    // Modo padrão: aprovação do pagamento.
    const paymentId = crypto.randomUUID()
    const paidAt = new Date().toISOString()

    const updatedOrder: MockOrder = {
      ...order,
      status: 'confirmed',
      paymentId,
      paidAt,
      version: (order.version ?? 1) + 1,
    }

    orders[orderIndex] = updatedOrder
    writeStorage('greenmint-orders', orders)

    emitRealtime('order.updated', {
      eventId: crypto.randomUUID(),
      resource: 'order',
      resourceId: updatedOrder.id,
      version: updatedOrder.version,
      userId: updatedOrder.userId,
      data: updatedOrder,
    })

    return HttpResponse.json(
      {
        paymentId,
        orderId: order.id,
        status: 'approved',
        message: 'Pagamento aprovado com sucesso!',
        simulated: true,
        paidAt,
      },
      { status: 200 },
    )
  }),

  // Consultar carteira vinculada à conta
  http.get('/api/wallet', ({ request }) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const sessions = readStorage<MockSession[]>('greenmint-sessions', [])
    const session = sessions.find((item) => item.token === token)
    if (!session) return HttpResponse.json({ message: 'Sessão inválida ou expirada.' }, { status: 401 })
    const wallets = readStorage<Record<string, { address: string; network: string; connectedAt: string }>>('greenmint-wallets', {})
    return HttpResponse.json(wallets[session.userId] ?? null)
  }),

  // Vincular ou atualizar endereço público da carteira
  http.put('/api/wallet', async ({ request }) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const sessions = readStorage<MockSession[]>('greenmint-sessions', [])
    const session = sessions.find((item) => item.token === token)
    if (!session) return HttpResponse.json({ message: 'Sessão inválida ou expirada.' }, { status: 401 })

    const body = (await request.json()) as { address?: string; network?: string }
    const address = body.address?.trim()
    const network = body.network
    const validNetwork = ['Ethereum', 'Polygon', 'Solana'].includes(network ?? '')
    const validAddress = network === 'Solana'
      ? Boolean(address && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address))
      : Boolean(address && /^0x[a-fA-F0-9]{40}$/.test(address))

    if (!validNetwork || !validAddress) {
      return HttpResponse.json({ message: 'Informe um endereço público válido para a rede selecionada.' }, { status: 400 })
    }

    const wallets = readStorage<Record<string, { address: string; network: string; connectedAt: string }>>('greenmint-wallets', {})
    const wallet = { address, network: network!, connectedAt: new Date().toISOString() }
    wallets[session.userId] = wallet
    writeStorage('greenmint-wallets', wallets)
    return HttpResponse.json(wallet)
  }),

  // Desvincular carteira da conta
  http.delete('/api/wallet', ({ request }) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const sessions = readStorage<MockSession[]>('greenmint-sessions', [])
    const session = sessions.find((item) => item.token === token)
    if (!session) return HttpResponse.json({ message: 'Sessão inválida ou expirada.' }, { status: 401 })

    const wallets = readStorage<Record<string, { address: string; network: string; connectedAt: string }>>('greenmint-wallets', {})
    delete wallets[session.userId]
    writeStorage('greenmint-wallets', wallets)
    return new HttpResponse(null, { status: 204 })
  }),

  // Cadastrar usuário
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      name?: string
      email?: string
      password?: string
    }

    if (!body.name || !body.email || !body.password) {
      return HttpResponse.json(
        { message: 'Preencha todos os campos.' },
        { status: 400 },
      )
    }

    const users = readStorage<MockUser[]>(
      'greenmint-users',
      initialUsers,
    )

    const emailAlreadyExists = users.some(
      (user) =>
        user.email.toLowerCase() === body.email!.toLowerCase(),
    )

    if (emailAlreadyExists) {
      return HttpResponse.json(
        { message: 'Este e-mail já está cadastrado.' },
        { status: 409 },
      )
    }

    const newUser: MockUser = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash: await hashPassword(body.password),
    }

    users.push(newUser)
    writeStorage('greenmint-users', users)

    const token = crypto.randomUUID()
    const sessions = readStorage<MockSession[]>(
      'greenmint-sessions',
      [],
    )

    sessions.push({ token, userId: newUser.id })
    writeStorage('greenmint-sessions', sessions)

    return HttpResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
        token,
      },
      { status: 201 },
    )
  }),

  // Fazer login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }

    const users = readStorage<MockUser[]>(
      'greenmint-users',
      initialUsers,
    )

    const user = users.find(
      (item) =>
        item.email.toLowerCase() === body.email?.toLowerCase(),
    )

    const passwordHash =
      typeof body.password === 'string' && body.password
        ? await hashPassword(body.password)
        : null

    const hasValidPassword =
      user !== undefined &&
      passwordHash !== null &&
      (user.passwordHash === passwordHash ||
        // Usuário salvo antes da correção, com senha em texto puro.
        (user.passwordHash === undefined &&
          user.password === body.password))

    if (!user || !hasValidPassword || !passwordHash) {
      return HttpResponse.json(
        { message: 'E-mail ou senha inválidos.' },
        { status: 401 },
      )
    }

    // Migra o usuário legado: guarda o hash e descarta a senha pura.
    if (user.passwordHash === undefined) {
      user.passwordHash = passwordHash
      delete user.password
      writeStorage('greenmint-users', users)
    }

    const token = crypto.randomUUID()
    const sessions = readStorage<MockSession[]>(
      'greenmint-sessions',
      [],
    )

    sessions.push({ token, userId: user.id })
    writeStorage('greenmint-sessions', sessions)

    return HttpResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    })
  }),

  // Atualizar nome e e-mail do usuário autenticado
  http.patch('/api/auth/profile', async ({ request }) => {
    const authorization = request.headers.get('Authorization')
    const token = authorization?.replace('Bearer ', '')
    const sessions = readStorage<MockSession[]>('greenmint-sessions', [])
    const session = sessions.find((item) => item.token === token)

    if (!session) {
      return HttpResponse.json(
        { message: 'Sessão inválida ou expirada.' },
        { status: 401 },
      )
    }

    const body = (await request.json()) as {
      name?: string
      email?: string
    }
    const name = body.name?.trim()
    const email = body.email?.trim().toLowerCase()

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return HttpResponse.json(
        { message: 'Informe um nome e um e-mail válidos.' },
        { status: 400 },
      )
    }

    const users = readStorage<MockUser[]>('greenmint-users', initialUsers)
    const user = users.find((item) => item.id === session.userId)

    if (!user) {
      return HttpResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 },
      )
    }

    const emailInUse = users.some(
      (item) => item.id !== user.id && item.email.toLowerCase() === email,
    )

    if (emailInUse) {
      return HttpResponse.json(
        { message: 'Este e-mail já está sendo utilizado por outra conta.' },
        { status: 409 },
      )
    }

    user.name = name
    user.email = email
    writeStorage('greenmint-users', users)

    return HttpResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  }),

  // Alterar senha do usuário autenticado
  http.patch('/api/auth/password', async ({ request }) => {
    const authorization = request.headers.get('Authorization')
    const token = authorization?.replace('Bearer ', '')
    const sessions = readStorage<MockSession[]>('greenmint-sessions', [])
    const session = sessions.find((item) => item.token === token)

    if (!session) {
      return HttpResponse.json(
        { message: 'Sessão inválida ou expirada.' },
        { status: 401 },
      )
    }

    const body = (await request.json()) as {
      currentPassword?: string
      newPassword?: string
    }

    if (
      typeof body.currentPassword !== 'string' ||
      typeof body.newPassword !== 'string' ||
      body.newPassword.length < 6
    ) {
      return HttpResponse.json(
        { message: 'A nova senha precisa ter pelo menos 6 caracteres.' },
        { status: 400 },
      )
    }

    const users = readStorage<MockUser[]>('greenmint-users', initialUsers)
    const user = users.find((item) => item.id === session.userId)

    if (!user) {
      return HttpResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 },
      )
    }

    const currentHash = await hashPassword(body.currentPassword)
    const currentPasswordIsValid =
      user.passwordHash === currentHash ||
      (user.passwordHash === undefined && user.password === body.currentPassword)

    if (!currentPasswordIsValid) {
      return HttpResponse.json(
        { message: 'A senha atual está incorreta.' },
        { status: 400 },
      )
    }

    user.passwordHash = await hashPassword(body.newPassword)
    delete user.password
    writeStorage('greenmint-users', users)

    return HttpResponse.json({ message: 'Senha alterada com sucesso.' })
  }),

  // Consultar usuário autenticado
  http.get('/api/auth/me', ({ request }) => {
    const authorization = request.headers.get('Authorization')
    const token = authorization?.replace('Bearer ', '')

    const sessions = readStorage<MockSession[]>(
      'greenmint-sessions',
      [],
    )

    const session = sessions.find((item) => item.token === token)

    if (!session) {
      return HttpResponse.json(
        { message: 'Sessão inválida ou expirada.' },
        { status: 401 },
      )
    }

    const users = readStorage<MockUser[]>(
      'greenmint-users',
      initialUsers,
    )

    const user = users.find((item) => item.id === session.userId)

    if (!user) {
      return HttpResponse.json(
        { message: 'Usuário não encontrado.' },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  }),

  // Consultar favoritos do usuário autenticado
  http.get('/api/favorites', ({ request }) => {
    const authorization = request.headers.get('Authorization')
    const token = authorization?.replace('Bearer ', '')
    const sessions = readStorage<MockSession[]>('greenmint-sessions', [])
    const session = sessions.find((item) => item.token === token)

    if (!session) {
      return HttpResponse.json(
        { message: 'Usuário não autenticado.' },
        { status: 401 },
      )
    }

    const favorites = readStorage<string[]>(
      `greenmint-favorites-${session.userId}`,
      [],
    )

    return HttpResponse.json(favorites)
  }),

  // Adicionar NFT aos favoritos
  http.post('/api/favorites', async ({ request }) => {
    const authorization = request.headers.get('Authorization')
    const token = authorization?.replace('Bearer ', '')
    const sessions = readStorage<MockSession[]>('greenmint-sessions', [])
    const session = sessions.find((item) => item.token === token)

    if (!session) {
      return HttpResponse.json(
        { message: 'Usuário não autenticado.' },
        { status: 401 },
      )
    }

    const body = (await request.json()) as { nftId?: string }
    const nft = mockNfts.find((item) => item.id === body.nftId)

    if (!nft) {
      return HttpResponse.json(
        { message: 'NFT não encontrado.' },
        { status: 404 },
      )
    }

    const storageKey = `greenmint-favorites-${session.userId}`
    const favorites = readStorage<string[]>(storageKey, [])

    if (!favorites.includes(nft.id)) {
      favorites.push(nft.id)
      writeStorage(storageKey, favorites)
    }

    return HttpResponse.json(favorites, { status: 200 })
  }),

  // Remover NFT dos favoritos
  http.delete('/api/favorites/:nftId', ({ params, request }) => {
    const authorization = request.headers.get('Authorization')
    const token = authorization?.replace('Bearer ', '')
    const sessions = readStorage<MockSession[]>('greenmint-sessions', [])
    const session = sessions.find((item) => item.token === token)

    if (!session) {
      return HttpResponse.json(
        { message: 'Usuário não autenticado.' },
        { status: 401 },
      )
    }

    const storageKey = `greenmint-favorites-${session.userId}`
    const favorites = readStorage<string[]>(storageKey, [])
    const updated = favorites.filter((id) => id !== String(params.nftId))
    writeStorage(storageKey, updated)

    return HttpResponse.json(updated)
  }),
]
