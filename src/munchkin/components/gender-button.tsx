import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  active: boolean
  label: string
  children: ReactNode
  onClick: () => void
}

export function GenderButton({ active, label, children, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-center size-9 rounded-full transition-colors',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
