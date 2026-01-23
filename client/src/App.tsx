import { Route, Routes } from 'react-router';
import { useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import LandingPage from './pages/LandingPage';
import RoomPage from './pages/room/RoomPage';

export default function App() {
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/:roomId" element={<RoomPage />} />
    </Routes>
  );
}
