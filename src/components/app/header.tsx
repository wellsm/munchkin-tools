import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n/store"

type Props = {
  title: string
  onBack?: () => void
}

export function Header({ title, onBack }: Props) {
  const t = useT()

  return (
    <div className="flex border-b p-4 items-center justify-between">
      {onBack ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.common.back}
          onClick={onBack}
        >
          <ArrowLeft className="size-6" />
        </Button>
      ) : (
        <div className="size-11" aria-hidden />
      )}
      <h2 className="text-4xl font-munchkin">{title}</h2>
      <div className="size-11" aria-hidden />
    </div>
  )
}
