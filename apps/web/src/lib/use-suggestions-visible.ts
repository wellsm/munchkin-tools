import { useQuery } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'

// Conservative: only show once we confirm the flag is on. While loading
// (undefined) or disabled (false), hide — avoids a flash of the CTA.
export function useSuggestionsVisible(): boolean {
  const enabled = useQuery(api.suggestions.isEnabled)

  return enabled === true
}
