import { useEffect, useRef, useState } from 'react'

type Props = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function EditableNumber({
  value,
  onChange,
  min,
  max,
  disabled,
  className,
  ariaLabel,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.select()
    }
  }, [editing])

  if (disabled) {
    return <span className={className}>{value}</span>
  }

  function startEditing() {
    setDraft(String(value))
    setEditing(true)
  }

  function commit() {
    setEditing(false)
    const parsed = Number.parseInt(draft, 10)

    if (Number.isNaN(parsed)) {
      return
    }

    let next = parsed

    if (min !== undefined) {
      next = Math.max(min, next)
    }

    if (max !== undefined) {
      next = Math.min(max, next)
    }

    if (next !== value) {
      onChange(next)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) =>
          setDraft(e.target.value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, ''))
        }
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            inputRef.current?.blur()
          } else if (e.key === 'Escape') {
            setEditing(false)
          }
        }}
        className={`${className ?? ''} w-full bg-transparent text-center outline-none`}
        aria-label={ariaLabel}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className={className}
      aria-label={ariaLabel}
    >
      {value}
    </button>
  )
}
