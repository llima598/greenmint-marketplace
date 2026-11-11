import { Heart } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { useAuth } from '../context/useAuth'
import { useFavorites } from '../context/useFavorites'

interface FavoriteButtonProps {
  nftId: string
  className?: string
}

function FavoriteButton({
  nftId,
  className = '',
}: FavoriteButtonProps) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [isSaving, setIsSaving] = useState(false)
  const favorite = isFavorite(nftId)

  async function handleToggle() {
    if (isSaving) return

    setIsSaving(true)

    try {
      await toggleFavorite(nftId)
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar seus favoritos.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isAuthLoading) return null

  if (!user) {
    return (
      <Link
        to="/login"
        aria-label="Entre para salvar este NFT nos favoritos"
        title="Entre para favoritar"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#140D0A]/90 text-white transition hover:border-[#D9A441] hover:text-[#D9A441] ${className}`}
      >
        <Heart size={18} aria-hidden="true" />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={isSaving}
      aria-pressed={favorite}
      aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#140D0A]/90 transition hover:border-[#D9A441] disabled:cursor-wait disabled:opacity-50 ${favorite ? 'text-[#D9A441]' : 'text-white'} ${className}`}
    >
      <Heart
        size={18}
        fill={favorite ? 'currentColor' : 'none'}
        aria-hidden="true"
      />
    </button>
  )
}

export default FavoriteButton
