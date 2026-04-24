import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/store'

type Props = {
  roomCode: string
  inviteUrl: string
}

export function RoomShareCard({ roomCode, inviteUrl }: Props) {
  const t = useT()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can fail in insecure contexts; user can still scan the QR
    }
  }

  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-4 flex flex-col items-center gap-3">
      <p className="text-xs tracking-widest uppercase text-muted-foreground">
        {t.waitingRoom.roomCode}
      </p>
      <p className="font-munchkin text-6xl text-primary tabular-nums tracking-widest">
        {roomCode}
      </p>
      <div className="bg-white rounded-md p-3 mb-2">
        <QRCodeSVG value={inviteUrl} size={160} aria-label={inviteUrl} />
      </div>
      <Button variant="outline" className="w-full" onClick={handleCopy}>
        {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
        {copied ? t.waitingRoom.copied : t.waitingRoom.invite}
      </Button>
    </section>
  )
}
