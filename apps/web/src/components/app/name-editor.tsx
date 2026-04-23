import { Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useT } from '@/lib/i18n/store'

type Props = {
  name: string
  onRename: (name: string) => void
}

export function NameEditor({ name, onRename }: Props) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  useEffect(() => {
    if (!editing) {
      setDraft(name)
    }
  }, [name, editing])

  function commit() {
    const trimmed = draft.trim()

    if (trimmed.length > 0 && trimmed !== name) {
      onRename(trimmed)
    }

    setEditing(false)
  }

  function cancel() {
    setDraft(name)
    setEditing(false)
  }

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit()
          } else if (e.key === 'Escape') {
            cancel()
          }
        }}
        className="mt-4 w-auto min-w-40 max-w-full text-center text-3xl font-munchkin h-auto py-1"
        aria-label={t.heroEdit.heroNameAria}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="mt-4 flex items-center gap-2 cursor-pointer"
      aria-label={t.heroEdit.editName}
    >
      <span className="text-3xl font-munchkin">{name}</span>
      <Pencil className="size-4 text-muted-foreground" aria-hidden />
    </button>
  )
}
