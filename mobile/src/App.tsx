import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from './stores/useAuthStore';
import Auth from './components/Auth';
import { useDeviceRegistration } from './hooks/useDeviceRegistration';

export default function App() {
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useDeviceRegistration();

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Voice</Text>

        {isAuthenticated ? (
          <>
            <Text style={styles.info}>logged in as {user?.email}</Text>
            <TouchableOpacity style={styles.button} onPress={logout}>
              <Text style={styles.buttonText}>log out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Auth />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  info: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  button: {
    width: '100%',
    backgroundColor: '#1e40af',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f1f5f9',
    fontSize: 16,
  },
});
