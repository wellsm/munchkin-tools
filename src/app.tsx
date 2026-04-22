import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './routes/home'
import { MunchkinGame } from './routes/munchkin-game'
import { applyTheme, getStoredTheme } from './lib/theme'

export function App() {
  useEffect(() => {
    applyTheme(getStoredTheme())
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/munchkin" element={<MunchkinGame />} />
      </Routes>
    </BrowserRouter>
  )
}
