import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Gender } from '../types'

type Props = {
  active: boolean
  gender: Gender | null
  label: string
  children: ReactNode
  onClick: () => void
}

export function GenderButton({ active, gender, label, children, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-center size-12 rounded-full transition-colors p-2',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        gender === "male" && active && "bg-blue-300",
        gender === "female" && active && "bg-pink-300",
      )}
    >
      {children}
    </button>
  )
}
