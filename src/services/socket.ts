
import { io } from 'socket.io-client'

export const socket = io(window.location.origin, {
  path: '/socket.io/',
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000,
})
