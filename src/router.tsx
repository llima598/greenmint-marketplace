import { lazy, Suspense, type ReactNode } from 'react'
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'

import App from './App'
import ProtectedRoute from './components/ProtectedRoute'

const NftDetails = lazy(() => import('./pages/NftDetails'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Orders = lazy(() => import('./pages/Orders'))
const Profile = lazy(() => import('./pages/Profile'))
const Favorites = lazy(() => import('./pages/Favorites'))

function RouteLoading() {
  return (
    <main
      className="flex min-h-[50vh] items-center justify-center bg-[#140D0A] px-4 text-sm text-[#B7A99A]"
      role="status"
      aria-live="polite"
    >
      Carregando página...
    </main>
  )
}

function withSuspense(component: ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{component}</Suspense>
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>) => ({
    search: typeof search.search === 'string' ? search.search : undefined,
    sort: typeof search.sort === 'string' ? search.sort : undefined,
    minPrice:
      typeof search.minPrice === 'number' ? search.minPrice : undefined,
    maxPrice:
      typeof search.maxPrice === 'number' ? search.maxPrice : undefined,
    category:
      typeof search.category === 'string' ? search.category : undefined,
    network:
      typeof search.network === 'string' ? search.network : undefined,
    page:
      typeof search.page === 'number' && search.page > 0
        ? Math.floor(search.page)
        : undefined,
  }),
  component: App,
})

const nftDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$nftId',
  component: () => withSuspense(<NftDetails />),
})

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: () => withSuspense(<Cart />),
})

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: () =>
    withSuspense(
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>,
    ),
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => withSuspense(<Login />),
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => withSuspense(<Register />),
})

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: () =>
    withSuspense(
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>,
    ),
})

const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  component: () =>
    withSuspense(
      <ProtectedRoute>
        <Favorites />
      </ProtectedRoute>,
    ),
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () =>
    withSuspense(
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>,
    ),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  nftDetailsRoute,
  cartRoute,
  checkoutRoute,
  loginRoute,
  registerRoute,
  ordersRoute,
  profileRoute,
  favoritesRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
