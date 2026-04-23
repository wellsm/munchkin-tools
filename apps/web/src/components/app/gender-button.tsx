import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Gender } from '@/lib/types'

type Props = {
  active: boolean
  gender: Gender | null
  label: string
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}

export function GenderButton({ active, gender, label, children, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center size-12 rounded-full transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        gender === "male" && active && "bg-blue-300",
        gender === "female" && active && "bg-pink-300",
      )}
    >
      {children}
    </button>
  )
}
