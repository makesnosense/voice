import { Route, Routes } from 'react-router';
import LandingPage from './pages/LandingPage';
import RoomPage from './pages/room/RoomPage';
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />}></Route>
      <Route path="/:roomId" element={<RoomPage />}></Route>
    </Routes>
  )
}