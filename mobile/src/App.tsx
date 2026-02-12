import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getFcmToken } from './utils/fcm';
import { ensureNotificationPermissions } from './utils/permissions';
import { useAuthStore } from './stores/useAuthStore';

export default function App() {
  const [permissionStatus, setPermissionStatus] =
    useState<string>('checking...');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    const initialize = async () => {
      // one-liner: check and request if needed
      const status = await ensureNotificationPermissions();
      setPermissionStatus(status);

      // get token after permissions resolved
      const fcmToken = await getFcmToken();
      setToken(fcmToken);

      if (fcmToken && status === 'authorized') {
        // TODO: register device with backend
        console.log('✅ ready to register device');
      }
    };

    initialize();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice</Text>
      <Text style={styles.info}>
        Notifications permission: {permissionStatus}
      </Text>
      <Text style={styles.info}>
        Token: {token ? `${token.substring(0, 20)}...` : 'none'}
      </Text>
    </View>
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
});
