
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { socket } from '../services/socket'
import {
  createRealtimeEventGuard,
  type RealtimeEvent,
} from '../services/realtime'
import { useAuth } from '../context/useAuth'
import type { NFT } from '../data/nfts'

interface RealtimeOrder {
  id: string
  userId: string
  version?: number
  [key: string]: unknown
}

function SocketConnection() {
  const queryClient = useQueryClient()
  const { user, token } = useAuth()

  const authRef = useRef({
    userId: user?.id,
    token,
  })

  const eventGuard = useRef(createRealtimeEventGuard())

  // Mantém os dados de autenticação atualizados após a renderização.
  useEffect(() => {
    authRef.current = {
      userId: user?.id,
      token,
    }
  }, [user?.id, token])

  useEffect(() => {
    function handleConnect() {
      console.log('[Socket.IO] Conectado!', socket.id)

      socket.emit('client:ping')

      socket.emit('client:identify', {
        token: authRef.current.token,
      })

      queryClient.invalidateQueries({ queryKey: ['nfts'] })

      if (authRef.current.userId) {
        queryClient.invalidateQueries({
          queryKey: ['orders', authRef.current.userId],
        })
      }
    }

    function handleConnectError(error: Error) {
      console.error('[Socket.IO] Erro:', error.message)
    }

    function handlePong(data: { at: number }) {
      console.log('[Socket.IO] Pong recebido!', data)
    }

    function handleNftUpdated(event: RealtimeEvent<NFT>) {
      if (
        event.resource !== 'nft' ||
        event.resourceId !== event.data.id ||
        !eventGuard.current.isNewEvent(event)
      ) {
        return
      }

      // Catálogo e carrinho (o CartProvider observa a mesma chave ['nfts']).
      queryClient.setQueryData<NFT[]>(['nfts'], (current) =>
        current?.map((nft) =>
          nft.id === event.resourceId
            ? { ...nft, ...event.data }
            : nft,
        ),
      )

      // Página de detalhe do NFT.
      queryClient.setQueryData<NFT>(
        ['nfts', event.resourceId],
        (current) =>
          current ? { ...current, ...event.data } : current,
      )

      console.log('[Socket.IO] NFT atualizado:', event.resourceId)
    }

    function handleOrderUpdated(event: RealtimeEvent<RealtimeOrder>) {
      const currentUserId = authRef.current.userId

      if (
        event.resource !== 'order' ||
        !currentUserId ||
        event.userId !== currentUserId ||
        event.data.userId !== currentUserId ||
        event.resourceId !== event.data.id ||
        !eventGuard.current.isNewEvent(event)
      ) {
        return
      }

      queryClient.setQueryData<RealtimeOrder[]>(
        ['orders', currentUserId],
        (current) =>
          current?.map((order) =>
            order.id === event.resourceId
              ? { ...order, ...event.data }
              : order,
          ),
      )

      console.log('[Socket.IO] Pedido atualizado:', event.resourceId)
    }

    socket.on('connect', handleConnect)
    socket.on('connect_error', handleConnectError)
    socket.on('server:pong', handlePong)
    socket.on('nft.updated', handleNftUpdated)
    socket.on('order.updated', handleOrderUpdated)

    socket.connect()

    return () => {
      socket.off('connect', handleConnect)
      socket.off('connect_error', handleConnectError)
      socket.off('server:pong', handlePong)
      socket.off('nft.updated', handleNftUpdated)
      socket.off('order.updated', handleOrderUpdated)

      socket.disconnect()
    }
  }, [queryClient])

  useEffect(() => {
    if (socket.connected) {
      socket.emit('client:identify', { token })
    }
  }, [user?.id, token])

  return null
}

export default SocketConnection
