import { useState } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ToastAndroid,
} from 'react-native';
import RNFS from 'react-native-fs';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useAuthStore } from '../../../stores/useAuthStore';
import { api } from '../../../api';
import { pressedStyle } from '../../../styles/common';
import {
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  NEUTRAL_COLOR,
  BACKGROUND_CARD,
} from '../../../styles/colors';

async function requestStoragePermission(): Promise<boolean> {
  if (Number(Platform.Version) >= 29) return true;
  const status = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
  return status === RESULTS.GRANTED;
}

export default function ExportData() {
  const getValidAccessToken = useAuthStore(state => state.getValidAccessToken);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const granted = await requestStoragePermission();
      if (!granted) return;

      const accessToken = await getValidAccessToken();
      const data = await api.users.exportData(accessToken);
      const path = `${RNFS.DownloadDirectoryPath}/voice-data-export.json`;
      await RNFS.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
      ToastAndroid.show(`Saved to ${path}`, ToastAndroid.LONG);
    } catch (error) {
      console.error('❌ failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && !isExporting && pressedStyle,
      ]}
      onPress={handleExport}
      disabled={isExporting}
    >
      <Text style={styles.label}>Export my data</Text>
      {isExporting ? (
        <ActivityIndicator size="small" color={TEXT_SECONDARY} />
      ) : (
        <Text style={styles.hint}>JSON</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BACKGROUND_CARD,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  hint: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
});
