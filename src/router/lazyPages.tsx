import { lazy } from 'react'

export const NftDetails = lazy(() => import('../pages/NftDetails'))
export const Cart = lazy(() => import('../pages/Cart'))
export const Checkout = lazy(() => import('../pages/Checkout'))
export const Login = lazy(() => import('../pages/Login'))
export const Register = lazy(() => import('../pages/Register'))
export const Orders = lazy(() => import('../pages/Orders'))
export const Profile = lazy(() => import('../pages/Profile'))
export const Favorites = lazy(() => import('../pages/Favorites'))

export function RouteLoading() {
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
