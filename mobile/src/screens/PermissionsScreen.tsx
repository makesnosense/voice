import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { AppPermissions } from '../hooks/useAppPermissions.types';
import { PERMISSION_STATUS } from '../hooks/useAppPermissions.types';

interface PermissionsScreenProps {
  permissions: AppPermissions;
}

export default function PermissionsScreen({
  permissions,
}: PermissionsScreenProps) {
  const { notificationsPermission, microphonePermission, requestAll } =
    permissions;

  useEffect(() => {
    requestAll();
  }, [requestAll]);

  const items = [
    {
      key: 'notifications',
      label: 'notifications — required to receive incoming calls',
      status: notificationsPermission.status,
    },
    {
      key: 'microphone',
      label: 'microphone — required for voice calls',
      status: microphonePermission.status,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice needs access</Text>
      <Text style={styles.subtitle}>
        both permissions are required to use the app
      </Text>

      <View style={styles.list}>
        {items.map(({ key, label, status }) => (
          <View key={key} style={styles.row}>
            <Text
              style={[
                styles.dot,
                status === PERMISSION_STATUS.DENIED && styles.dotDenied,
              ]}
            >
              {status === PERMISSION_STATUS.GRANTED ? '●' : '○'}
            </Text>
            <Text style={styles.label}>{label}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.button} onPress={requestAll}>
        <Text style={styles.buttonText}>grant permissions</Text>
      </Pressable>

      <Text style={styles.hint}>
        if the system dialog doesn't appear, open settings and grant manually
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
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  list: {
    width: '100%',
    gap: 10,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    color: '#22c55e',
    fontSize: 16,
    lineHeight: 20,
  },
  dotDenied: {
    color: '#ef4444',
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#1e40af',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#f1f5f9',
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },
});
