import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MunchkinGame } from './munchkin-game'
import { PlayerEdit } from './player-edit'
import { applyTheme, getStoredTheme } from '@/lib/theme'
import { useWakeLockEffect } from '@/lib/wake-lock'

export function App() {
  useEffect(() => {
    applyTheme(getStoredTheme())
  }, [])

  useWakeLockEffect()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MunchkinGame />} />
        <Route path="/player/:id" element={<PlayerEdit />} />
      </Routes>
    </BrowserRouter>
  )
}
