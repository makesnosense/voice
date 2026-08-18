import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react-native';
import { pressedStyle } from '../styles/common';
import { PROD_HOST } from '../config';
import {
  BACKGROUND_PRIMARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
} from '../styles/colors';
import { HEALTH_URL } from '../config';

interface NoConnectionScreenProps {
  onRetry: () => void;
  isRetrying: boolean;
}

const HEALTH_CHECK_TIMEOUT_MS = 5000;

export async function checkServerReachable(): Promise<boolean> {
  // never because success path with resolve is never reached with setTimeout
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), HEALTH_CHECK_TIMEOUT_MS),
  );
  try {
    const response = await Promise.race([
      fetch(`${HEALTH_URL}?t=${Date.now()}`),
      timeout,
    ]);
    return response.ok;
  } catch {
    return false;
  }
}

export default function NoConnectionScreen({
  onRetry,
  isRetrying,
}: NoConnectionScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom || 24 },
      ]}
    >
      <View style={styles.content}>
        <WifiOff size={52} color={TEXT_MUTED} strokeWidth={1.5} />
        <View style={styles.textGroup}>
          <Text style={styles.title}>{t('connection.title')}</Text>
          <Text style={styles.subtitle}>{t('connection.subtitle')}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && pressedStyle]}
          onPress={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <ActivityIndicator color={BACKGROUND_PRIMARY} />
          ) : (
            <Text style={styles.buttonText}>{t('connection.retry')}</Text>
          )}
        </Pressable>
      </View>
      <Text style={styles.serverLabel}>
        <Text style={styles.serverKey}>{t('connection.serverLabel')}</Text>
        {PROD_HOST}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 24,
  },
  textGroup: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 21,
  },
  button: {
    backgroundColor: TEXT_PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonText: {
    color: BACKGROUND_PRIMARY,
    fontSize: 15,
    fontWeight: '500',
  },
  serverLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  serverKey: {
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
});
