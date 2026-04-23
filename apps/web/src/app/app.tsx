import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import { useWakeLockEffect } from "@/lib/wake-lock";
import { Landing } from "./landing";
import { MunchkinGame } from "./munchkin-game";
import { PlayerEdit } from "./player-edit";
import { WaitingRoom } from "./waiting-room";

export function App() {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  useWakeLockEffect();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/offline" element={<MunchkinGame />} />
        <Route path="/player/:id" element={<PlayerEdit />} />
        <Route path="/online/:roomId" element={<WaitingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}
