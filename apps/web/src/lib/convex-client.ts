import { ConvexReactClient } from 'convex/react'

const url = import.meta.env.VITE_CONVEX_URL

if (!url) {
  throw new Error(
    'VITE_CONVEX_URL is not set. Copy apps/web/.env.example to apps/web/.env.local and fill it with your Convex deployment URL (see packages/convex/README.md).',
  )
}

export const convexClient = new ConvexReactClient(url)
