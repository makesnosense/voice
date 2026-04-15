import { Route, Routes } from 'react-router';
import { useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { useDeviceRegistration } from './hooks/useDeviceRegistration';
import ContactsPage from './pages/contacts/ContactsPage';
import LandingPage from './pages/LandingPage';
import SettingsPage from './pages/settings/SettingsPage';
import RoomPage from './pages/room/RoomPage';

export default function App() {
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useDeviceRegistration();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/:roomId" element={<RoomPage />} />
    </Routes>
  );
}
