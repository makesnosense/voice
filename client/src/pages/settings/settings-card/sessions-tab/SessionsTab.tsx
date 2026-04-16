import { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { api } from '../../../../api';
import SessionRow from './SessionRow';
import styles from './SessionsTab.module.css';
import type { Device } from '../../../../../../shared/types/devices';

export default function SessionsTab() {
  const getValidAccessToken = useAuthStore((state) => state.getValidAccessToken);
  const getRefreshToken = useAuthStore((state) => state.getRefreshToken);
  const currentDeviceJti = useAuthStore((state) => state.currentDeviceJti);

  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingJti, setRemovingJti] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      const accessToken = await getValidAccessToken();
      const result = await api.devices.getDevices(accessToken);
      setDevices(result);
    } catch (error) {
      console.error('❌ failed to load devices:', error);
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
      setDevices((prev) => prev.filter((d) => d.jti !== jti));
    } catch (error) {
      console.error('❌ failed to remove session:', error);
    } finally {
      setRemovingJti(null);
    }
  };

  const currentDevice = devices.find((d) => d.jti === currentDeviceJti) ?? null;
  const otherDevices = devices.filter((d) => d.jti !== currentDeviceJti);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Loader size={16} className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {currentDevice && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>this device</span>
          <div className={styles.deviceList}>
            <SessionRow device={currentDevice} isCurrentDevice />
          </div>
        </div>
      )}
      {otherDevices.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>other devices</span>
          <div className={styles.deviceList}>
            {otherDevices.map((device, index) => (
              <div key={device.jti}>
                {index > 0 && <div className={styles.separator} />}
                <SessionRow
                  device={device}
                  isRemoving={removingJti === device.jti}
                  onRemove={() => handleRemove(device.jti)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
