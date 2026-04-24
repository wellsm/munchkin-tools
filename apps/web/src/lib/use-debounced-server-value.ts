import { useEffect, useState } from 'react'
import { useDebounce } from '@uidotdev/usehooks'

/**
 * Optimistic local state that mirrors a server value. `onCommit` fires once
 * the user's edits settle for `delay` ms — batches rapid +/- taps into a
 * single mutation. External server updates reset the local copy so the UI
 * reflects ground truth after the commit lands.
 */
export function useDebouncedServerValue<T>(
  value: T,
  onCommit: (next: T) => void,
  delay = 500,
) {
  const [local, setLocal] = useState<T>(value)

  const debounced = useDebounce(local, delay)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocal(value)
  }, [value])

  useEffect(() => {
    if (debounced !== value) {
      onCommit(debounced)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return [local, setLocal] as const
}
