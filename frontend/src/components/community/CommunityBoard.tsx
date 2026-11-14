import { Button, Chip, Tabs } from '@heroui/react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { closeCommunityNotice, listCommunityNotices } from '../../api'
import type { CommunityNotice } from '../../types'
import {
  CalendarIcon,
  ClockIcon,
  SoccerBallIcon,
  StadiumIcon,
  SwordsIcon,
} from '../common/Icons'
import { WhatsAppIcon } from '../whatsapp/WhatsAppButton'
import { PILL_TAB_CLASS, PILL_TAB_LIST_CLASS } from '../../utils/tabs'
import CreateNoticeModal from './CreateNoticeModal'

export default function CommunityBoard(): React.JSX.Element {
  const queryClient = useQueryClient()
  const [selectedTab, setSelectedTab] = useState<string>('todos')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['community-notices'],
    queryFn: listCommunityNotices,
  })

  const closeMutation = useMutation({
    mutationFn: (id: string) => closeCommunityNotice(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['community-notices'] })
    },
  })

  const filteredNotices = notices.filter((n) => {
    if (selectedTab === 'falta_uno') return n.type === 'falta_uno'
    if (selectedTab === 'desafio_rival') return n.type === 'desafio_rival'
    return true
  })

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl text-white">
            Tablón Comunitario
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Encontrá jugadores para completar tu equipo o desafiá a otros conjuntos a un partido amistoso.
          </p>
        </div>

        <Button
          variant="primary"
          className="min-h-11 shrink-0 bg-[#c5d86d] text-neutral-950 font-black hover:bg-[#b5c85d] shadow-sm"
          onPress={() => setShowCreateModal(true)}
        >
          + Publicar aviso
        </Button>
      </div>

      <Tabs.Root
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(String(key))}
      >
        <Tabs.List className={PILL_TAB_LIST_CLASS}>
          <Tabs.Tab id="todos" className={PILL_TAB_CLASS}>
            Todos ({notices.length})
          </Tabs.Tab>
          <Tabs.Tab id="falta_uno" className={PILL_TAB_CLASS}>
            Falta 1 ({notices.filter((n) => n.type === 'falta_uno').length})
          </Tabs.Tab>
          <Tabs.Tab id="desafio_rival" className={PILL_TAB_CLASS}>
            Desafíos ({notices.filter((n) => n.type === 'desafio_rival').length})
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border p-5 border-white/10 bg-neutral-900/60"
            />
          ))}
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center shadow-sm border-white/10 bg-neutral-900/60">
          <p className="text-base font-bold text-white">
            No hay avisos abiertos en esta categoría.
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            ¿Buscás jugador o rival? Sé el primero en publicar un aviso hoy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="flex flex-col justify-between rounded-2xl border p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all hover:border-[#c5d86d] border-white/10 bg-neutral-900/60"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Chip
                    size="sm"
                    variant="soft"
                    className={
                      notice.type === 'falta_uno'
                        ? 'bg-[#c5d86d]/20 font-black text-[#c5d86d]'
                        : 'bg-amber-500/20 font-black text-amber-400'
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {notice.type === 'falta_uno' ? (
                        <SoccerBallIcon className="size-3.5" />
                      ) : (
                        <SwordsIcon className="size-3.5" />
                      )}
                      <span>{notice.type === 'falta_uno' ? 'Falta 1' : 'Desafío'}</span>
                    </span>
                  </Chip>

                  {notice.type === 'falta_uno' && notice.positionNeeded && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      {notice.positionNeeded}
                    </span>
                  )}
                </div>

                <h3 className="mt-2.5 text-base font-bold text-white">
                  {notice.title}
                </h3>

                <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                  {notice.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-200">
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 bg-neutral-800">
                    <CalendarIcon className="size-3.5 text-neutral-400" />
                    {notice.date}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 bg-neutral-800">
                    <ClockIcon className="size-3.5 text-neutral-400" />
                    {notice.timeSlot}
                  </span>
                  {notice.courtName && (
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 bg-neutral-800">
                      <StadiumIcon className="size-3.5 text-neutral-400" />
                      {notice.courtName}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t pt-3 border-white/10">
                <a
                  href={buildWhatsAppLink(notice)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#c5d86d] px-3 text-xs font-black text-neutral-950 transition hover:bg-[#b5c85d] shadow-sm"
                >
                  <WhatsAppIcon className="size-4 shrink-0 text-neutral-950" />
                  Contactar por WhatsApp
                </a>

                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-10 text-[11px] font-medium hover:text-danger text-neutral-400"
                  onPress={() => closeMutation.mutate(notice.id)}
                  isDisabled={closeMutation.isPending}
                  aria-label="Marcar como completado"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateNoticeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}