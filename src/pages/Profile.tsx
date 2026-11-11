import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'

import { api } from '../services/api'
import { useAuth } from '../context/useAuth'

interface Order {
  id: string
  status: 'pending' | 'confirmed' | 'rejected'
  items: {
    id: string
    name: string
    price: number | null
  }[]
  total: number
  createdAt: string
}

function getRequestError(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

function isValidPrice(price: unknown): price is number {
  return typeof price === 'number' && Number.isFinite(price)
}

function formatETH(price: unknown): string {
  return isValidPrice(price)
    ? `${price.toFixed(2)} ETH`
    : 'Preço indisponível'
}

function Profile() {
  const { user, token, updateProfile, updatePassword } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const response = await api.get<Order[]>('/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    },
    enabled: Boolean(user && token),
  })

  if (!user) {
    return null
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (!name.trim() || !email.trim()) {
      setProfileError('Preencha seu nome e e-mail.')
      return
    }

    setIsSavingProfile(true)

    try {
      await updateProfile(name, email)
      setName(name.trim())
      setEmail(email.trim().toLowerCase())
      setProfileSuccess('Seus dados foram atualizados com sucesso.')
    } catch (error) {
      setProfileError(
        getRequestError(error, 'Não foi possível atualizar seus dados.'),
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 6) {
      setPasswordError('A nova senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação da nova senha não corresponde.')
      return
    }

    setIsSavingPassword(true)

    try {
      await updatePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Sua senha foi alterada com sucesso.')
    } catch (error) {
      setPasswordError(
        getRequestError(error, 'Não foi possível alterar sua senha.'),
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  const confirmedOrders =
    orders?.filter((order) => order.status === 'confirmed') ?? []

  const purchasedNFTs = confirmedOrders.flatMap((order) => order.items)

  return (
    <main className="min-h-screen bg-[#140D0A] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          search={{
            search: undefined,
            sort: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            category: undefined,
            network: undefined,
            page: undefined,
          }}
          className="text-sm text-[#B7A99A] transition hover:text-white"
        >
          ← Voltar para a loja
        </Link>

        <h1 className="mt-8 text-3xl font-bold">Meu perfil</h1>
        <p className="mt-2 text-[#B7A99A]">
          Gerencie seus dados, sua senha e acompanhe sua coleção.
        </p>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Informações da conta</h2>

          <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="profile-name" className="mb-2 block text-sm text-[#B7A99A]">
                Nome completo
              </label>
              <input
                id="profile-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={80}
                className="w-full rounded-xl border border-white/10 bg-[#140D0A] px-4 py-3 text-white outline-none transition focus:border-[#D9A441]"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="mb-2 block text-sm text-[#B7A99A]">
                E-mail
              </label>
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#140D0A] px-4 py-3 text-white outline-none transition focus:border-[#D9A441]"
              />
            </div>

            {profileError && (
              <p role="alert" className="text-sm text-red-400">{profileError}</p>
            )}
            {profileSuccess && (
              <p role="status" className="text-sm text-green-400">{profileSuccess}</p>
            )}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="rounded-full bg-[#D9A441] px-6 py-3 font-semibold text-[#140D0A] transition hover:bg-[#edbd62] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingProfile ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Alterar senha</h2>
          <p className="mt-2 text-sm text-[#B7A99A]">
            Para sua segurança, informe sua senha atual antes de cadastrar uma nova.
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="current-password" className="mb-2 block text-sm text-[#B7A99A]">
                Senha atual
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-[#140D0A] px-4 py-3 text-white outline-none transition focus:border-[#D9A441]"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm text-[#B7A99A]">
                Nova senha
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={6}
                required
                className="w-full rounded-xl border border-white/10 bg-[#140D0A] px-4 py-3 text-white outline-none transition focus:border-[#D9A441]"
              />
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="mb-2 block text-sm text-[#B7A99A]">
                Confirmar nova senha
              </label>
              <input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={6}
                required
                className="w-full rounded-xl border border-white/10 bg-[#140D0A] px-4 py-3 text-white outline-none transition focus:border-[#D9A441]"
              />
            </div>

            {passwordError && (
              <p role="alert" className="text-sm text-red-400">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p role="status" className="text-sm text-green-400">{passwordSuccess}</p>
            )}

            <button
              type="submit"
              disabled={isSavingPassword}
              className="rounded-full border border-[#D9A441]/60 px-6 py-3 font-semibold text-[#D9A441] transition hover:bg-[#D9A441]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingPassword ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Minha coleção</h2>
            <span className="rounded-full bg-[#D9A441]/15 px-3 py-1 text-sm text-[#D9A441]">
              {purchasedNFTs.length} NFTs
            </span>
          </div>

          {isLoading && (
            <p className="mt-5 text-sm text-[#B7A99A]">Carregando sua coleção...</p>
          )}
          {isError && (
            <p className="mt-5 text-sm text-red-400">Não foi possível carregar sua coleção.</p>
          )}
          {!isLoading && !isError && purchasedNFTs.length === 0 && (
            <p className="mt-5 text-sm text-[#B7A99A]">
              Você ainda não possui NFTs adquiridos.
            </p>
          )}
          {!isLoading && !isError && purchasedNFTs.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {purchasedNFTs.map((nft, index) => (
                <article
                  key={`${nft.id}-${index}`}
                  className="rounded-xl border border-white/10 bg-black/20 p-5"
                >
                  <h3 className="font-semibold">{nft.name}</h3>
                  <p className="mt-2 text-sm text-[#B7A99A]">{formatETH(nft.price)}</p>
                  <span className="mt-4 inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                    Adquirido
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Carteira digital</h2>
          <p className="mt-3 text-sm text-[#B7A99A]">Nenhuma carteira conectada.</p>
          <button
            type="button"
            disabled
            className="mt-5 cursor-not-allowed rounded-full border border-white/20 px-5 py-2 text-sm text-white/40"
          >
            Conectar carteira
          </button>
          <p className="mt-3 text-xs text-white/40">
            Integração de carteira será implementada posteriormente.
          </p>
        </section>
      </div>
    </main>
  )
}

export default Profile
