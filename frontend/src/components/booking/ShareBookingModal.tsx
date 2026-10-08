import { Button, Chip, Modal } from '@heroui/react'
import { useState } from 'react'
import { WhatsAppIcon } from '../whatsapp/WhatsAppButton'
import { buildMatchShareMessage, type ShareBookingInput } from '../../utils/whatsapp'

interface ShareBookingModalProps {
  share: ShareBookingInput
  onClose: () => void
}

export default function ShareBookingModal({
  share,
  onClose,
}: ShareBookingModalProps): React.JSX.Element {
  const [copied, setCopied] = useState(false)
  const message = buildMatchShareMessage(share)

  async function copyMessage(): Promise<void> {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Modal.Root isOpen onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="md">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Compartir con el equipo</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <p className="text-sm text-tertiary dark:text-mauve-soft">
                Enviá los datos del partido a tu grupo de WhatsApp.
              </p>
              <pre className="whitespace-pre-wrap rounded-xl border border-line bg-paper/70 p-4 text-sm text-coffee dark:border-mauve dark:bg-mauve-deep/60 dark:text-[#f3efe8]">
                {message}
              </pre>
              {copied && (
                <Chip color="success" size="sm">
                  Mensaje copiado
                </Chip>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="min-h-11 w-full sm:w-auto" onPress={onClose}>
              Cerrar
            </Button>
            <Button variant="ghost" className="min-h-11 w-full sm:w-auto" onPress={copyMessage}>
              Copiar mensaje
            </Button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
            >
              <WhatsAppIcon className="size-4" />
              Compartir por WhatsApp
            </a>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}
