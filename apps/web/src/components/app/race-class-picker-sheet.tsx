import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Chip } from './chip'

export type PickerItem<T extends string> = {
  id: T
  label: string
  icon: LucideIcon
  color: string
}

type Props<T extends string> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  items: PickerItem<T>[]
  selected: T[]
  max: number
  onToggle: (id: T) => void
}

export function RaceClassPickerSheet<T extends string>({
  open,
  onOpenChange,
  title,
  description,
  items,
  selected,
  max,
  onToggle,
}: Props<T>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[80dvh]"
        {...(description ? {} : { "aria-describedby": undefined })}
      >
        <SheetHeader>
          <SheetTitle className="font-munchkin text-2xl">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="p-4 flex flex-col gap-2 justify-center">
          {items.map((item) => {
            const Icon = item.icon
            const isSelected = selected.includes(item.id)
            const atMax = !isSelected && selected.length >= max

            return (
              <Chip
                key={item.id}
                active={isSelected}
                color={item.color}
                disabled={atMax}
                onClick={() => onToggle(item.id)}
                className="w-full"
                size="lg"
                rounded={false}
                variant={isSelected ?  "ghost" : "default"}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Chip>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
