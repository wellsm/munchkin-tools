import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './routes/home'
import { MunchkinGame } from './routes/munchkin_game'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/munchkin" element={<MunchkinGame />} />
      </Routes>
    </BrowserRouter>
  )
}
