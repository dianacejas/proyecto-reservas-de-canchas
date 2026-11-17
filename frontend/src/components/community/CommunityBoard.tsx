import { Button } from '@heroui/react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { closeCommunityNotice, deleteCommunityNotice, listCommunityNotices } from '../../api'
import { useAuth } from '../../auth/useAuth'
import type { CommunityNotice } from '../../types'
import {
  CalendarIcon,
  ClockIcon,
  LockIcon,
  ShieldCheckIcon,
  StadiumIcon,
  SwordsIcon,
  UsersIcon,
} from '../common/Icons'
import { WhatsAppIcon } from '../whatsapp/WhatsAppButton'
import CreateNoticeModal from './CreateNoticeModal'

type FilterTab = 'todos' | 'falta_uno' | 'desafio_rival'

const TTL_48_HOURS_MS = 48 * 60 * 60 * 1000

function getRemainingHours(createdAt?: string): number {
  if (!createdAt) return 48
  const createdMs = new Date(createdAt).getTime()
  if (Number.isNaN(createdMs)) return 48
  const elapsedMs = Date.now() - createdMs
  return Math.max(0, Math.ceil((TTL_48_HOURS_MS - elapsedMs) / (60 * 60 * 1000)))
}

export default function CommunityBoard(): React.JSX.Element {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { isAuthenticated, user, isAdmin } = useAuth()
  const [selectedTab, setSelectedTab] = useState<FilterTab>('todos')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const { data: rawNotices = [], isLoading } = useQuery({
    queryKey: ['community-notices'],
    queryFn: listCommunityNotices,
  })

  // Expiración automática de avisos con más de 48 horas de antigüedad
  const notices = useMemo(
    () => rawNotices.filter((n) => getRemainingHours(n.createdAt) > 0),
    [rawNotices],
  )

  const closeMutation = useMutation({
    mutationFn: (id: string) => (isAdmin ? deleteCommunityNotice(id) : closeCommunityNotice(id)),
    onSuccess: (_closed, id) => {
      queryClient.setQueryData<CommunityNotice[]>(['community-notices'], (old = []) =>
        old.filter((item) => item.id !== id),
      )
      void queryClient.invalidateQueries({ queryKey: ['community-notices'] })
    },
  })

  const faltaUnoCount = notices.filter((n) => n.type === 'falta_uno').length
  const desafiosCount = notices.filter((n) => n.type === 'desafio_rival').length

  const filteredNotices = notices.filter((n) => {
    if (selectedTab === 'falta_uno') return n.type === 'falta_uno'
    if (selectedTab === 'desafio_rival') return n.type === 'desafio_rival'
    return true
  })

  const filterPills: { id: FilterTab; label: string; count: number }[] = [
    { id: 'todos', label: 'Todos', count: notices.length },
    { id: 'falta_uno', label: 'Falta 1', count: faltaUnoCount },
    { id: 'desafio_rival', label: 'Desafíos', count: desafiosCount },
  ]

  function handlePublishClick(): void {
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }
    setShowAuthPrompt(false)
    setShowCreateModal(true)
  }

  function buildWhatsAppLink(notice: CommunityNotice): string {
    const cleanPhone = notice.contactPhone.replace(/\D/g, '')
    const fullPhone = cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`
    const text =
      notice.type === 'falta_uno'
        ? `¡Hola! Vi tu aviso "${notice.title}" en Copa 5 para el turno ${notice.date} a las ${notice.timeSlot}. ¿Siguen necesitando jugador?`
        : `¡Hola! Vi tu desafío "${notice.title}" en Copa 5 para jugar el ${notice.date} a las ${notice.timeSlot}. Tenemos equipo para jugar.`
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c5d86d]/30 bg-[#c5d86d]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#c5d86d]">
            <span className="size-1.5 rounded-full bg-[#c5d86d]" />
            Matchmaking en tiempo real · Vigencia 48h
          </span>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Tablón Comunitario
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Encontrá jugadores para completar tu equipo o desafiá a otros conjuntos a un partido amistoso.
          </p>
        </div>

        <Button
          variant="primary"
          className="min-h-11 shrink-0 rounded-xl bg-[#c5d86d] px-5 font-black text-neutral-950 shadow-[0_0_20px_rgba(197,216,109,0.18)] transition-all hover:bg-[#b5c85d]"
          onPress={handlePublishClick}
        >
          + Publicar aviso
        </Button>
      </div>

      {/* Alerta amigable si intenta publicar sin sesión */}
      {showAuthPrompt && !isAuthenticated && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#c5d86d]/40 bg-neutral-900/95 p-4 shadow-xl sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#c5d86d]/15 text-[#c5d86d]">
              <LockIcon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">
                Se requiere una cuenta activa para publicar avisos
              </p>
              <p className="text-xs text-neutral-400">
                Iniciá sesión o registrate en segundos para asociar el aviso a tu perfil de jugador.
              </p>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-neutral-400 hover:text-white"
              onPress={() => setShowAuthPrompt(false)}
            >
              Cerrar
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="bg-[#c5d86d] font-black text-neutral-950 hover:bg-[#b5c85d]"
              onPress={() => navigate('/login', { state: { from: '/comunidad' } })}
            >
              Iniciar sesión / Registrarse
            </Button>
          </div>
        </div>
      )}

      {/* Filtros Superiores (Pills interactivos) */}
      <div
        role="tablist"
        aria-label="Filtrar avisos de la comunidad"
        className="flex flex-wrap items-center gap-2"
      >
        {filterPills.map((pill) => {
          const active = selectedTab === pill.id
          return (
            <button
              key={pill.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedTab(pill.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                active
                  ? 'border-[#c5d86d] bg-[#c5d86d] text-neutral-950 shadow-[0_0_15px_rgba(197,216,109,0.2)]'
                  : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:border-neutral-700 hover:text-white'
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-black tabular-nums ${
                  active
                    ? 'bg-neutral-950/20 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {pill.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Listado de tarjetas */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5"
            />
          ))}
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-10 text-center shadow-sm">
          <p className="text-base font-bold text-white">
            No hay avisos abiertos en esta categoría.
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            ¿Buscás jugador o rival? Sé el primero en publicar un aviso hoy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotices.map((notice) => {
            const isFaltaUno = notice.type === 'falta_uno'
            const remainingHours = getRemainingHours(notice.createdAt)
            const canManage = isAdmin || (user !== null && notice.userId === user.id)

            return (
              <article
                key={notice.id}
                className="group flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/75 p-5 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c5d86d]/60"
              >
                <div>
                  {/* Badge superior distintivo */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${
                        isFaltaUno
                          ? 'border-[#c5d86d]/35 bg-[#c5d86d]/15 text-[#c5d86d]'
                          : 'border-amber-500/35 bg-amber-500/15 text-amber-300'
                      }`}
                    >
                      {isFaltaUno ? (
                        <UsersIcon className="size-3.5 shrink-0" />
                      ) : (
                        <ShieldCheckIcon className="size-3.5 shrink-0" />
                      )}
                      <span>{isFaltaUno ? 'Falta Jugador' : 'Desafío de Equipo'}</span>
                    </span>

                    {isFaltaUno && notice.positionNeeded ? (
                      <span className="rounded-full border border-neutral-700 bg-neutral-800/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                        Puesto: {notice.positionNeeded}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950/70 px-2.5 py-0.5 text-[11px] font-bold text-neutral-400">
                        <SwordsIcon className="size-3 text-amber-400" />
                        Amistoso
                      </span>
                    )}
                  </div>

                  {/* Título y descripción */}
                  <h3 className="mt-3.5 text-base font-black leading-snug text-white sm:text-lg">
                    {notice.title}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-400">
                    {notice.description}
                  </p>

                  {/* Autor y vigencia de 48h */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
                    <span>
                      Por <strong className="text-neutral-200">{notice.authorName || 'Jugador Copa 5'}</strong>
                    </span>
                    <span className="rounded-md bg-neutral-950 px-2 py-0.5 font-semibold text-neutral-400">
                      Expira en {remainingHours}h
                    </span>
                  </div>

                  {/* Tags de fecha, horario y cancha */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-200">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1">
                      <CalendarIcon className="size-3.5 text-[#c5d86d]" />
                      {notice.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1">
                      <ClockIcon className="size-3.5 text-[#c5d86d]" />
                      {notice.timeSlot}
                    </span>
                    {notice.courtName && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1">
                        <StadiumIcon className="size-3.5 text-[#c5d86d]" />
                        {notice.courtName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pie de tarjeta con CTA WhatsApp */}
                <div className="mt-5 flex items-center gap-2 border-t border-neutral-800/80 pt-3.5">
                  <a
                    href={buildWhatsAppLink(notice)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c5d86d] px-3.5 py-2 text-xs font-black text-neutral-950 shadow-[0_0_15px_rgba(197,216,109,0.15)] transition-all hover:bg-[#b5c85d]"
                  >
                    <WhatsAppIcon className="size-4 shrink-0 text-neutral-950" />
                    Contactar por WhatsApp
                  </a>

                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-10 rounded-xl px-3 text-xs font-semibold text-neutral-400 hover:bg-neutral-800 hover:text-red-400"
                      onPress={() => closeMutation.mutate(notice.id)}
                      isDisabled={closeMutation.isPending}
                      aria-label="Cerrar o eliminar aviso"
                    >
                      {isAdmin ? 'Eliminar' : 'Cerrar'}
                    </Button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <CreateNoticeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}
