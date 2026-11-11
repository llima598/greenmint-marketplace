import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { router } from './router'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import './index.css'

const queryClient = new QueryClient()

async function enableMocking() {
  const shouldEnableMocking =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'true'

  if (shouldEnableMocking) {
    const { worker } = await import('./mocks/browser')

    await worker.start({
      onUnhandledRequest: 'bypass',
    })

    console.log(
      '[MSW] Handlers registrados:',
      worker.listHandlers().map((handler) => handler.kind),
    )
  }
}

async function bootstrap() {
  await enableMocking()

  const { default: SocketConnection } = await import(
    './components/SocketConnection'
  )

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <SocketConnection />
            <RouterProvider router={router} />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

bootstrap()