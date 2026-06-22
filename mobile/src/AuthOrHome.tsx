import { useAuthStore } from './stores/useAuthStore';
import AuthScreen from './screens/auth/AuthScreen';
import HomeScreen from './screens/HomeScreen';

export default function AuthOrHome() {
  const isInitializing = useAuthStore(state => state.isInitializing);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (isInitializing) return null;
  if (isAuthenticated) return <HomeScreen />;
  return <AuthScreen />;
}
