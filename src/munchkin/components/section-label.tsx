import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  variant?: 'default' | 'danger'
}

export function SectionLabel({ children, variant = 'default' }: Props) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className={cn(
          'text-base tracking-wider uppercase shrink-0',
          variant === 'danger' ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {children}
      </span>
      <div className={cn('flex-1 h-px', variant === 'danger' ? 'bg-destructive/40' : 'bg-border')} />
    </div>
  )
}
