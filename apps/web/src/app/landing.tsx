import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/store'
import { OnlineSheet } from '@/components/app/online-sheet'

export function Landing() {
  const t = useT()
  const navigate = useNavigate()
  const [onlineOpen, setOnlineOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center px-6 gap-12">
      <h1 className="text-6xl font-munchkin text-primary text-center">
        {t.landing.title}
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button size="lg" variant="outline" className="h-16 text-lg" onClick={() => navigate('/offline')}>
          <User className="size-6" />
          {t.landing.offline}
        </Button>
        <Button size="lg" className="h-16 text-lg" onClick={() => setOnlineOpen(true)}>
          <Globe className="size-6" />
          {t.landing.online}
        </Button>
      </div>

      <OnlineSheet open={onlineOpen} onOpenChange={setOnlineOpen} />
    </div>
  )
}
