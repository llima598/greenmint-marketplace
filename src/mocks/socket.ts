
import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'

type SocketIoConnection = ReturnType<typeof toSocketIo>

export type RealtimeEventName = 'nft.updated' | 'order.updated'

export interface RealtimeEvent<T = unknown> {
  eventId: string
  resource: 'nft' | 'order'
  resourceId: string
  version: number
  userId?: string
  data: T
}

interface ConnectionMetadata {
  userId?: string
}

interface MockSession {
  token: string
  userId: string
}

const connections = new Map<SocketIoConnection, ConnectionMetadata>()

function findUserIdByToken(token: string): string | undefined {
  try {
    const sessions = JSON.parse(
      localStorage.getItem('greenmint-sessions') ?? '[]',
    ) as MockSession[]

    return sessions.find((session) => session.token === token)?.userId
  } catch {
    return undefined
  }
}

export function emitRealtime<T>(
  event: RealtimeEventName,
  payload: RealtimeEvent<T>,
) {
  connections.forEach((meta, io) => {
    if (payload.userId && meta.userId !== payload.userId) {
      return
    }

    io.client.emit(event, payload)
  })
}

const socketLink = ws.link('/')

export const socketHandlers = [
  socketLink.addEventListener('connection', (connection) => {
    const url = new URL(connection.client.url)

    if (!url.pathname.startsWith('/socket.io')) {
      return
    }

    console.log('[MSW] Conexão Socket.IO interceptada')

    const io = toSocketIo(connection)

    const metadata: ConnectionMetadata = {}

    connections.set(io, metadata)

    const heartbeat = setInterval(() => {
      connection.client.send('2')
    }, 25_000)

    io.client.on('client:ping', () => {
      console.log('[MSW] Ping recebido')

      io.client.emit('server:pong', {
        at: Date.now(),
      })
    })

    io.client.on(
  'client:identify',
  (_event, data: { token?: string | null }) => {
    const userId = data?.token
      ? findUserIdByToken(data.token)
      : undefined

    metadata.userId = userId

    console.log(
      '[MSW] Sessão identificada:',
      userId ?? 'usuário não autenticado',
    )
  },
)

    connection.client.addEventListener('close', () => {
      clearInterval(heartbeat)
      connections.delete(io)

      console.log('[MSW] Conexão Socket.IO encerrada')
    })
  }),
]
