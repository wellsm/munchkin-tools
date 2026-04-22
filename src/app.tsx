import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MunchkinGame } from './routes/munchkin-game'
import { PlayerEdit } from './routes/player-edit'
import { applyTheme, getStoredTheme } from './lib/theme'

export function App() {
  useEffect(() => {
    applyTheme(getStoredTheme())
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MunchkinGame />} />
        <Route path="/player/:id" element={<PlayerEdit />} />
      </Routes>
    </BrowserRouter>
  )
}
