import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  active: boolean
  size?: 'sm' | 'default' | 'lg'
  children: ReactNode
  color?: string
  rounded?: boolean
} & ComponentProps<"button">

export function Chip({ active, size = 'default', children, color, rounded = true, ...props }: Props) {
  const useCustomColor = active && color !== undefined

  return (
    <button
      {...props}
      type="button"
      aria-pressed={active}
      style={useCustomColor ? { backgroundColor: color, color: 'oklch(0.15 0 0)' } : undefined}
      className={cn(
        'inline-flex items-center gap-2 border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        active
          ? useCustomColor
            ? 'border-transparent'
            : 'bg-primary text-primary-foreground border-primary'
          : 'bg-transparent text-foreground border-border hover:bg-accent',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'default' && 'px-4 py-2 text-base',
        size === 'lg' && "px-4 py-3 text-lg",
        rounded ? "rounded-full" : "rounded-xl",
        props.className
      )}
    >
      {children}
    </button>
  )
}
