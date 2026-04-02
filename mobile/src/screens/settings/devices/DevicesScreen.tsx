import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../../../stores/useAuthStore';
import { api } from '../../../api';
import Header from '../../../components/Header';
import DeviceRow from './DeviceRow';
import type { Device } from '../../../../../shared/types/devices';

interface DevicesScreenProps {
  onBack: () => void;
}

function DevicesScreen({ onBack }: DevicesScreenProps) {
  const insets = useSafeAreaInsets();
  const { getValidAccessToken, getRefreshToken, currentDeviceJti } =
    useAuthStore();

  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [removingJti, setRemovingJti] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      const accessToken = await getValidAccessToken();
      const result = await api.devices.getDevices(accessToken);
      setDevices(result);
    } catch (error) {
      console.error('❌ failed to fetch devices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getValidAccessToken]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleRemove = async (jti: string) => {
    setRemovingJti(jti);
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return;
      await api.auth.terminateSession(jti, refreshToken);
      setDevices(prev => prev.filter(d => d.jti !== jti));
    } catch (error) {
      console.error('❌ failed to remove device:', error);
    } finally {
      setRemovingJti(null);
    }
  };

  const currentDevice =
    devices.find(device => device.jti === currentDeviceJti) ?? null;

  const otherDevices = devices.filter(
    device => device.jti !== currentDeviceJti,
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Devices"
        leftSlot={
          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}
          >
            <ArrowLeft size={22} color="#0f172a" strokeWidth={1.75} />
          </Pressable>
        }
        rightSlot={
          <Pressable
            onPress={() => setIsEditing(prev => !prev)}
            hitSlop={8}
            disabled={otherDevices.length === 0}
          >
            <Text
              style={[
                styles.editButton,
                otherDevices.length === 0 && styles.editButtonDisabled,
              ]}
            >
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </Pressable>
        }
      />

      {isLoading ? (
        <ActivityIndicator style={styles.loader} color="#94a3b8" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {currentDevice && (
            <>
              <Text style={styles.sectionLabel}>this device</Text>
              <View style={styles.card}>
                <DeviceRow
                  device={currentDevice}
                  isCurrentDevice
                  isEditing={false}
                  isRemoving={false}
                  onRemove={() => {}}
                />
              </View>
              <View style={styles.sectionGap} />
            </>
          )}

          {otherDevices.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>other devices</Text>
              <View style={styles.card}>
                {otherDevices.map((device, index) => (
                  <View key={device.jti}>
                    {index > 0 && <View style={styles.separator} />}
                    <DeviceRow
                      device={device}
                      isCurrentDevice={false}
                      isEditing={isEditing}
                      isRemoving={removingJti === device.jti}
                      onRemove={() => handleRemove(device.jti)}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  editButton: {
    fontSize: 15,
    color: '#0f172a',
    textAlign: 'right',
  },
  editButtonDisabled: {
    opacity: 0,
  },
  loader: {
    marginTop: 48,
  },
  content: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#a1a1aa',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  card: {
    backgroundColor: '#f4f4f5',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d4d4d8',
    overflow: 'hidden',
  },
  sectionGap: {
    height: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e4e4e7',
  },
});

export default memo(DevicesScreen);
