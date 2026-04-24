import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider } from 'convex/react'
import { convexClient } from './lib/convex-client'
import { App } from './app/app'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convexClient}>
      <App />
    </ConvexProvider>
  </StrictMode>,
)
