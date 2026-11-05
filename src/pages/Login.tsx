
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../context/useAuth'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate({
  to: '/',
  search: {
    search: undefined,
    sort: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    category: undefined,
    network: undefined,
    page: undefined,
  },
})
    } catch {
      setError('E-mail ou senha inválidos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#140D0A] px-6 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#241612] p-8 sm:p-10">
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
          className="text-2xl font-black tracking-tight"
        >
          KURIO<span className="text-[#D9A441]">.</span>
        </Link>

        <h1 className="mt-10 text-3xl font-bold">
          Bem-vindo de volta
        </h1>

        <p className="mt-2 text-sm text-white/50">
          Entre na sua conta para continuar.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full rounded-xl border border-white/10 bg-[#140D0A] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#D9A441]"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Senha
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              required
              className="w-full rounded-xl border border-white/10 bg-[#140D0A] px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#D9A441]"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#D9A441] px-6 py-4 font-bold text-[#140D0A] transition hover:bg-[#edbd62] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-white/50">
          Ainda não tem uma conta?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#D9A441] hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Login
