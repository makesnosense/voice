import { Route, Routes } from 'react-router';
import LandingPage from './pages/LandingPage';
import RoomPage from './pages/room/RoomPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/:roomId" element={<RoomPage />} />
    </Routes>
  )
}