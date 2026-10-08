import { Button } from '@heroui/react'
import { useEffect, useState } from 'react'
import { WhatsAppIcon } from '../whatsapp/WhatsAppButton'
import { downloadTextFile } from '../../utils/tournamentExport'

export default function ExportBar({
  text,
  filename,
}: {
  text: string
  filename: string
}): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="ghost" onPress={copy}>
        {copied ? 'Copiado' : 'Copiar'}
      </Button>
      <Button size="sm" variant="secondary" onPress={() => downloadTextFile(filename, text)}>
        Descargar .txt
      </Button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-full bg-[#25d366] px-3 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <WhatsAppIcon className="size-3.5" />
        Compartir
      </a>
    </div>
  )
}
