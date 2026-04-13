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
import { useAuthStore } from '../../../stores/useAuthStore';
import { api } from '../../../api';
import Header from '../../../components/Header';
import DeviceRow from './DeviceRow';
import HeaderBackButton from '../../../components/HeaderBackButton';
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  NEUTRAL_COLOR,
  BORDER_MUTED,
  BACKGROUND_PRIMARY,
  BACKGROUND_CARD,
} from '../../../styles/colors';
import { pressedStyle } from '../../../styles/common';
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
      console.error('❌ Failed to load devices:', error);
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
        leftSlot={<HeaderBackButton onPress={onBack} />}
        rightSlot={
          <Pressable
            style={({ pressed }) => pressed && pressedStyle}
            onPress={() => setIsEditing(prev => !prev)}
            disabled={otherDevices.length === 0}
            hitSlop={12}
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
        <ActivityIndicator style={styles.loader} color={TEXT_MUTED} />
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
    backgroundColor: BACKGROUND_PRIMARY,
  },
  editButton: {
    fontSize: 17,
    color: TEXT_PRIMARY,
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
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  card: {
    backgroundColor: BACKGROUND_CARD,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    overflow: 'hidden',
  },
  sectionGap: {
    height: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER_MUTED,
  },
});

export default memo(DevicesScreen);
