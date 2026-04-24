import { useQuery } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'

// Conservative: only show once we confirm the flag is on. While loading
// (undefined) or disabled (false), hide — avoids a flash of the support CTA.
export function useSupportVisible(): boolean {
  const enabled = useQuery(api.support.isSupportEnabled)

  return enabled === true
}
